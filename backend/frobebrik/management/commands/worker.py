import time
import subprocess
import shutil
import sys
from django.core.management.base import BaseCommand
from django.utils import timezone
from frobebrik.models import Submission


class Command(BaseCommand):
    help = 'Simple DB-polling worker that executes pending submissions inside docker (if available)'

    def handle(self, *args, **options):
        self.stdout.write('Worker started at %s' % timezone.now())
        docker = shutil.which('docker')
        while True:
            pending = Submission.objects.filter(status='pending').order_by('created_at')[:5]
            if not pending:
                time.sleep(2)
                continue

            for sub in pending:
                try:
                    sub.status = 'running'
                    sub.attempts += 1
                    sub.save()

                    if docker:
                        cmd = [docker, 'run', '--rm', '-i', '--network', 'none', '--pids-limit', '64', '--memory', '128m', '--cpus', '0.5', 'python:3.11-slim', 'python', '-']
                        proc = subprocess.run(cmd, input=sub.code, capture_output=True, text=True, timeout=10)
                        sub.stdout = proc.stdout
                        sub.stderr = proc.stderr
                        sub.status = 'done'
                        sub.save()
                    else:
                        # fallback local execution
                        import tempfile
                        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                            f.write(sub.code)
                            fname = f.name
                        proc = subprocess.run([sys.executable, fname], capture_output=True, text=True, timeout=10)
                        sub.stdout = proc.stdout
                        sub.stderr = proc.stderr
                        sub.status = 'done'
                        sub.save()
                except subprocess.TimeoutExpired:
                    sub.status = 'error'
                    sub.stderr = 'timeout'
                    sub.save()
                except Exception as e:
                    sub.status = 'error'
                    sub.stderr = str(e)
                    sub.save()

            time.sleep(0.5)
