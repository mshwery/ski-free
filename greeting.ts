export function greeting(name?: string): string {
  if (name === undefined || name === "") {
    return "Hello!";
  }
  return `Hello, ${name}!`;
}
