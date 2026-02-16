// ============================================
// CODE EXECUTION SERVICE (Piston API)
// ============================================
// Piston is a free, open-source code execution engine
// Public API: https://emkc.org/api/v2/piston
// Supports 50+ languages with sandboxed execution

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';
const EXECUTION_TIMEOUT = 10000; // 10 seconds max

// ============================================
// TYPES
// ============================================

export interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
}

export interface ExecutionResult {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    output: string;
  };
}

export interface ExecuteOptions {
  stdin?: string;
  args?: string[];
  compileTimeout?: number;
  runTimeout?: number;
}

// Popular languages with display metadata
export const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python', version: '3.10.0', icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', version: '18.15.0', icon: '🟨' },
  { id: 'typescript', label: 'TypeScript', version: '5.0.3', icon: '🔷' },
  { id: 'java', label: 'Java', version: '15.0.2', icon: '☕' },
  { id: 'c', label: 'C', version: '10.2.0', icon: '⚙️' },
  { id: 'cpp', label: 'C++', version: '10.2.0', icon: '⚙️' },
  { id: 'csharp', label: 'C#', version: '6.12.0', icon: '🟦' },
  { id: 'go', label: 'Go', version: '1.16.2', icon: '🐹' },
  { id: 'rust', label: 'Rust', version: '1.68.2', icon: '🦀' },
  { id: 'ruby', label: 'Ruby', version: '3.0.1', icon: '💎' },
  { id: 'php', label: 'PHP', version: '8.2.3', icon: '🐘' },
  { id: 'swift', label: 'Swift', version: '5.3.3', icon: '🍎' },
  { id: 'kotlin', label: 'Kotlin', version: '1.8.20', icon: '🟣' },
  { id: 'bash', label: 'Bash', version: '5.2.0', icon: '🖥️' },
  { id: 'sql', label: 'SQLite', version: '3.36.0', icon: '🗃️' },
];

// Default code templates for each language
export const CODE_TEMPLATES: Record<string, string> = {
  python: `# Python 3.10
print("Hello from SmartPromptIQ!")

# Try some math
numbers = [1, 2, 3, 4, 5]
print(f"Sum: {sum(numbers)}")
print(f"Average: {sum(numbers) / len(numbers)}")`,

  javascript: `// JavaScript (Node.js 18)
console.log("Hello from SmartPromptIQ!");

// Try some array operations
const numbers = [1, 2, 3, 4, 5];
console.log("Sum:", numbers.reduce((a, b) => a + b, 0));
console.log("Squared:", numbers.map(n => n ** 2));`,

  typescript: `// TypeScript 5.0
interface User {
  name: string;
  age: number;
}

const user: User = { name: "SmartPromptIQ", age: 1 };
console.log(\`Hello, \${user.name}! Age: \${user.age}\`);`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from SmartPromptIQ!");

        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int n : numbers) sum += n;
        System.out.println("Sum: " + sum);
    }
}`,

  c: `#include <stdio.h>

int main() {
    printf("Hello from SmartPromptIQ!\\n");

    int numbers[] = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int i = 0; i < 5; i++) sum += numbers[i];
    printf("Sum: %d\\n", sum);
    return 0;
}`,

  cpp: `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int main() {
    cout << "Hello from SmartPromptIQ!" << endl;

    vector<int> nums = {1, 2, 3, 4, 5};
    cout << "Sum: " << accumulate(nums.begin(), nums.end(), 0) << endl;
    return 0;
}`,

  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello from SmartPromptIQ!")

    numbers := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, n := range numbers {
        sum += n
    }
    fmt.Printf("Sum: %d\\n", sum)
}`,

  rust: `fn main() {
    println!("Hello from SmartPromptIQ!");

    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}`,

  ruby: `# Ruby 3.0
puts "Hello from SmartPromptIQ!"

numbers = [1, 2, 3, 4, 5]
puts "Sum: #{numbers.sum}"
puts "Doubled: #{numbers.map { |n| n * 2 }}"`,

  php: `<?php
echo "Hello from SmartPromptIQ!\\n";

$numbers = [1, 2, 3, 4, 5];
echo "Sum: " . array_sum($numbers) . "\\n";
echo "Squared: " . implode(", ", array_map(fn($n) => $n ** 2, $numbers)) . "\\n";`,

  bash: `#!/bin/bash
echo "Hello from SmartPromptIQ!"

numbers=(1 2 3 4 5)
sum=0
for n in "\${numbers[@]}"; do
    sum=$((sum + n))
done
echo "Sum: $sum"`,

  csharp: `using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("Hello from SmartPromptIQ!");

        int[] numbers = {1, 2, 3, 4, 5};
        Console.WriteLine($"Sum: {numbers.Sum()}");
    }
}`,
};

// ============================================
// RUNTIME LISTING
// ============================================

let cachedRuntimes: PistonRuntime[] | null = null;

export async function getRuntimes(): Promise<PistonRuntime[]> {
  if (cachedRuntimes) return cachedRuntimes;

  const response = await fetch(`${PISTON_API_URL}/runtimes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch runtimes: ${response.status}`);
  }

  cachedRuntimes = await response.json();
  // Cache for 1 hour
  setTimeout(() => { cachedRuntimes = null; }, 3600_000);
  return cachedRuntimes!;
}

// ============================================
// CODE EXECUTION
// ============================================

export async function executeCode(
  language: string,
  code: string,
  options: ExecuteOptions = {}
): Promise<ExecutionResult> {
  // Validate code length
  if (code.length > 50_000) {
    throw new Error('Code exceeds maximum length of 50,000 characters');
  }

  // Find the runtime version
  const runtimes = await getRuntimes();
  const runtime = runtimes.find(
    (r) => r.language === language || r.aliases.includes(language)
  );

  if (!runtime) {
    throw new Error(`Unsupported language: ${language}. Use GET /api/code/runtimes to see available languages.`);
  }

  const response = await fetch(`${PISTON_API_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: runtime.language,
      version: runtime.version,
      files: [{ name: getFileName(language), content: code }],
      stdin: options.stdin || '',
      args: options.args || [],
      compile_timeout: options.compileTimeout || EXECUTION_TIMEOUT,
      run_timeout: options.runTimeout || EXECUTION_TIMEOUT,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Code execution failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

// ============================================
// HELPERS
// ============================================

function getFileName(language: string): string {
  const extensions: Record<string, string> = {
    python: 'main.py',
    javascript: 'main.js',
    typescript: 'main.ts',
    java: 'Main.java',
    c: 'main.c',
    cpp: 'main.cpp',
    csharp: 'Main.cs',
    go: 'main.go',
    rust: 'main.rs',
    ruby: 'main.rb',
    php: 'main.php',
    swift: 'main.swift',
    kotlin: 'Main.kt',
    bash: 'main.sh',
    sql: 'main.sql',
  };
  return extensions[language] || 'main.txt';
}
