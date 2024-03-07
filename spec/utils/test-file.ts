import process from 'child_process';
import stripAnsi from 'strip-ansi';

export async function testFile(file: string, config: string = 'default'): Promise<{ code: number | null, terminalOutput: string }> {
  const child = process.exec(`web-test-runner --config spec/configs/web-test-runner.config_${config}.mjs ${file}`);
  let scriptOutput = "";

  if (child.stdout && child.stderr) {
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (data: any) => {
      scriptOutput += stripAnsi(data.toString());
    });
    child.stderr.on('data', (data: any) => {
      scriptOutput += stripAnsi(data.toString());
    });
  }

  return new Promise((resolve) => {
    child.on('exit', (code: any) => {
      // console.log('code', scriptOutput);
      resolve({code, terminalOutput: scriptOutput});
    })
  });
}
