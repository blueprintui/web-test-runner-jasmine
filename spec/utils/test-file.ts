import process from 'child_process';

export async function testFile(file: string): Promise<{ code: number | null, terminalOutput: string }> {
  const child = process.exec(`web-test-runner ${file}`);
  let scriptOutput = "";

  if (child.stdout && child.stderr) {
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (data: any) => {
      scriptOutput += data.toString();
    });
    child.stderr.on('data', (data: any) => {
      scriptOutput += data.toString();
    });
  }

  return new Promise((resolve) => {
    child.on('exit', (code: any) => {
      resolve({code, terminalOutput: scriptOutput});
    })
  });
}
