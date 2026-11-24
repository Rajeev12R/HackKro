import connectToDatabase from "./mongoose"
import { Test, type ITestQuestion } from "@/models/test"
import { TestCandidate } from "@/models/test-candidate"

export const DEFAULT_INSTRUCTIONS = [
  "This is a timed assessment. The countdown timer will start the moment you click 'Start Assessment'.",
  "The test consists of 30 multiple-choice questions (1 mark each). Each question has only one correct answer.",
  "Your final score and rank will be determined based on: (1) Total marks scored and (2) Total completion time (faster submission breaks ties).",
  "Do NOT switch browser tabs, open other applications, or minimize the window. Proctoring monitors tab switching.",
  "You can navigate freely between questions using the Question Palette on the right.",
  "You can mark questions for review and return to them before the final submission.",
  "The test will automatically submit when the timer expires. You can also manually submit whenever you finish.",
  "Ensure a stable internet connection throughout the assessment. Results and rank will be recorded upon submission.",
]

export const DEFAULT_QUESTIONS: ITestQuestion[] = [
  // SECTION A: EASY (Q1 to Q10) - 1 Mark Each
  {
    id: "q1",
    question: "Which function is the entry point of a C program?",
    options: [
      { id: "opt_a", text: "start()" },
      { id: "opt_b", text: "run()" },
      { id: "opt_c", text: "main()" },
      { id: "opt_d", text: "init()" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "Execution of every C program begins from the main() function.",
  },
  {
    id: "q2",
    question: "What is the output of the following code snippet?",
    codeSnippet: `int a = 10, b = 3;
printf("%d", a % b);`,
    options: [
      { id: "opt_a", text: "3" },
      { id: "opt_b", text: "1" },
      { id: "opt_c", text: "0" },
      { id: "opt_d", text: "3.33" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "The modulus operator (%) returns the remainder of integer division. 10 % 3 = 1.",
  },
  {
    id: "q3",
    question: "What is the index of the first element in a C array?",
    options: [
      { id: "opt_a", text: "0" },
      { id: "opt_b", text: "1" },
      { id: "opt_c", text: "-1" },
      { id: "opt_d", text: "Depends on compiler" },
    ],
    correctOptionId: "opt_a",
    points: 1,
    explanation: "C uses 0-based indexing for arrays, so the first element is always located at index 0.",
  },
  {
    id: "q4",
    question: "Which loop executes at least once, even if its condition is initially false?",
    options: [
      { id: "opt_a", text: "for" },
      { id: "opt_b", text: "while" },
      { id: "opt_c", text: "do-while" },
      { id: "opt_d", text: "nested-loop" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "The do-while loop tests its condition at the end of the loop body, ensuring at least one execution.",
  },
  {
    id: "q5",
    question: "What will be printed by this code?",
    codeSnippet: `int a = 5;
printf("%d", a++);`,
    options: [
      { id: "opt_a", text: "5" },
      { id: "opt_b", text: "6" },
      { id: "opt_c", text: "4" },
      { id: "opt_d", text: "Error" },
    ],
    correctOptionId: "opt_a",
    points: 1,
    explanation: "a++ is post-increment: the current value (5) is passed to printf, and a is incremented to 6 afterwards.",
  },
  {
    id: "q6",
    question: "Which keyword is used to return a value from a function?",
    options: [
      { id: "opt_a", text: "break" },
      { id: "opt_b", text: "continue" },
      { id: "opt_c", text: "return" },
      { id: "opt_d", text: "exit" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "The 'return' keyword terminates function execution and yields a value back to the caller.",
  },
  {
    id: "q7",
    question: "Which is the correct declaration of an integer array containing 5 elements?",
    options: [
      { id: "opt_a", text: "int arr;" },
      { id: "opt_b", text: "arr int[5];" },
      { id: "opt_c", text: "int arr[5];" },
      { id: "opt_d", text: "array int(5);" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "In C, arrays are declared as `type identifier[size];`, hence `int arr[5];`.",
  },
  {
    id: "q8",
    question: "Which operator checks whether two values are equal?",
    options: [
      { id: "opt_a", text: "=" },
      { id: "opt_b", text: ":=" },
      { id: "opt_c", text: "==" },
      { id: "opt_d", text: "===" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "'==' is the relational equality comparison operator in C, whereas '=' is the assignment operator.",
  },
  {
    id: "q9",
    question: "Which header file is required for printf() and scanf()?",
    options: [
      { id: "opt_a", text: "conio.h" },
      { id: "opt_b", text: "math.h" },
      { id: "opt_c", text: "stdlib.h" },
      { id: "opt_d", text: "stdio.h" },
    ],
    correctOptionId: "opt_d",
    points: 1,
    explanation: "<stdio.h> (Standard Input Output) contains declarations for standard I/O functions like printf() and scanf().",
  },
  {
    id: "q10",
    question: "How many elements can the following array store?",
    codeSnippet: `int arr[10];`,
    options: [
      { id: "opt_a", text: "9" },
      { id: "opt_b", text: "10" },
      { id: "opt_c", text: "11" },
      { id: "opt_d", text: "Infinite" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "The array `int arr[10];` reserves contiguous space for exactly 10 integers (indices arr[0] to arr[9]).",
  },

  // SECTION B: MODERATE (Q11 to Q20) - 1 Mark Each
  {
    id: "q11",
    question: "What is the output of this loop?",
    codeSnippet: `for (int i = 1; i <= 5; i++) {
    printf("%d ", i);
}`,
    options: [
      { id: "opt_a", text: "1 2 3 4" },
      { id: "opt_b", text: "1 2 3 4 5" },
      { id: "opt_c", text: "0 1 2 3 4" },
      { id: "opt_d", text: "5 4 3 2 1" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "The loop starts at i = 1 and increments up to and including i = 5, printing '1 2 3 4 5 '.",
  },
  {
    id: "q12",
    question: "What will be printed?",
    codeSnippet: `int a = 5, b = 2;
printf("%d", a / b);`,
    options: [
      { id: "opt_a", text: "2.5" },
      { id: "opt_b", text: "3" },
      { id: "opt_c", text: "2" },
      { id: "opt_d", text: "2.0" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "Both operands are integers, so integer division truncates the decimal part: 5 / 2 = 2.",
  },
  {
    id: "q13",
    question: "What is the value of arr[2]?",
    codeSnippet: `int arr[5] = {10, 20, 30, 40, 50};
printf("%d", arr[2]);`,
    options: [
      { id: "opt_a", text: "10" },
      { id: "opt_b", text: "20" },
      { id: "opt_c", text: "30" },
      { id: "opt_d", text: "40" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "0-based indexing: arr[0]=10, arr[1]=20, arr[2]=30.",
  },
  {
    id: "q14",
    question: "Which declaration represents a 2D integer array with 3 rows and 4 columns?",
    options: [
      { id: "opt_a", text: "int arr[4][3];" },
      { id: "opt_b", text: "int arr(3, 4);" },
      { id: "opt_c", text: "int arr[3, 4];" },
      { id: "opt_d", text: "int arr[3][4];" },
    ],
    correctOptionId: "opt_d",
    points: 1,
    explanation: "In C, multidimensional arrays are declared as `type identifier[num_rows][num_cols];`, which is `int arr[3][4];`.",
  },
  {
    id: "q15",
    question: "What will be the output?",
    codeSnippet: `int a = 5, b = 10;
printf("%d", a < b && b > 5);`,
    options: [
      { id: "opt_a", text: "0" },
      { id: "opt_b", text: "1" },
      { id: "opt_c", text: "5" },
      { id: "opt_d", text: "Error" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "Both expressions `(5 < 10)` and `(10 > 5)` evaluate to true (1). 1 && 1 evaluates to 1.",
  },
  {
    id: "q16",
    question: "What is the output of the following code?",
    codeSnippet: `int sum = 0;
for (int i = 1; i < 5; i++) {
    sum += i;
}
printf("%d", sum);`,
    options: [
      { id: "opt_a", text: "15" },
      { id: "opt_b", text: "5" },
      { id: "opt_c", text: "10" },
      { id: "opt_d", text: "0" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "The loop condition `i < 5` runs for i = 1, 2, 3, 4. sum = 1 + 2 + 3 + 4 = 10.",
  },
  {
    id: "q17",
    question: "How do you call a function named add that takes two integers as arguments?",
    options: [
      { id: "opt_a", text: "call add(2, 3);" },
      { id: "opt_b", text: "add(2, 3);" },
      { id: "opt_c", text: "add[2, 3];" },
      { id: "opt_d", text: "void add(2, 3);" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "In C, a function is invoked using its name followed by argument list in parentheses: `add(2, 3);`.",
  },
  {
    id: "q18",
    question: "What is printed?",
    codeSnippet: `int a = 4;
a += 3;
printf("%d", a);`,
    options: [
      { id: "opt_a", text: "4" },
      { id: "opt_b", text: "3" },
      { id: "opt_c", text: "7" },
      { id: "opt_d", text: "12" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "The shorthand `a += 3` is equivalent to `a = a + 3`. 4 + 3 = 7.",
  },
  {
    id: "q19",
    question: "What will be printed?",
    codeSnippet: `for (int i = 1; i <= 5; i++) {
    if (i == 3) continue;
    printf("%d ", i);
}`,
    options: [
      { id: "opt_a", text: "1 2" },
      { id: "opt_b", text: "1 2 4 5" },
      { id: "opt_c", text: "1 2 3 4 5" },
      { id: "opt_d", text: "3" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "When i equals 3, `continue` skips the rest of the loop body for that iteration, printing '1 2 4 5 '.",
  },
  {
    id: "q20",
    question: "What is printed by this code?",
    codeSnippet: `int a[2][2] = {{1, 2}, {3, 4}};
printf("%d", a[1][0]);`,
    options: [
      { id: "opt_a", text: "1" },
      { id: "opt_b", text: "2" },
      { id: "opt_c", text: "3" },
      { id: "opt_d", text: "4" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "Row 0 is {1, 2} and row 1 is {3, 4}. `a[1][0]` is the first element of row 1, which is 3.",
  },

  // SECTION C: TOUGH (Q21 to Q30) - 1 Mark Each
  {
    id: "q21",
    question: "What will be printed?",
    codeSnippet: `for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 2; j++) {
        printf("*");
    }
}`,
    options: [
      { id: "opt_a", text: "***" },
      { id: "opt_b", text: "*****" },
      { id: "opt_c", text: "******" },
      { id: "opt_d", text: "**" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "The outer loop runs 3 times and the inner loop runs 2 times per iteration. Total iterations = 3 * 2 = 6 asterisks.",
  },
  {
    id: "q22",
    question: "What is the output?",
    codeSnippet: `int a[5] = {1, 2, 3, 4, 5};
int sum = 0;
for (int i = 0; i < 5; i++) {
    if (a[i] % 2 != 0) {
        sum += a[i];
    }
}
printf("%d", sum);`,
    options: [
      { id: "opt_a", text: "6" },
      { id: "opt_b", text: "9" },
      { id: "opt_c", text: "15" },
      { id: "opt_d", text: "10" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "The condition `a[i] % 2 != 0` filters the odd numbers: 1, 3, and 5. sum = 1 + 3 + 5 = 9.",
  },
  {
    id: "q23",
    question: "What is the output of the following program?",
    codeSnippet: `int fun(int x) {
    return x * x;
}
int main() {
    printf("%d", fun(3) + fun(2));
    return 0;
}`,
    options: [
      { id: "opt_a", text: "25" },
      { id: "opt_b", text: "13" },
      { id: "opt_c", text: "10" },
      { id: "opt_d", text: "5" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "fun(3) returns 3 * 3 = 9. fun(2) returns 2 * 2 = 4. 9 + 4 = 13.",
  },
  {
    id: "q24",
    question: "What does this recursive function return for fun(4)?",
    codeSnippet: `int fun(int n) {
    if (n == 0) return 1;
    return n * fun(n - 1);
}`,
    options: [
      { id: "opt_a", text: "0" },
      { id: "opt_b", text: "1" },
      { id: "opt_c", text: "24" },
      { id: "opt_d", text: "120" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "This is the factorial function. fun(4) = 4 * 3 * 2 * 1 * fun(0) = 4 * 3 * 2 * 1 * 1 = 24.",
  },
  {
    id: "q25",
    question: "What is printed?",
    codeSnippet: `int a[3][3] = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
printf("%d", a[0][2] + a[2][0]);`,
    options: [
      { id: "opt_a", text: "8" },
      { id: "opt_b", text: "9" },
      { id: "opt_c", text: "10" },
      { id: "opt_d", text: "12" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "a[0][2] is row 0 column 2 which is 3. a[2][0] is row 2 column 0 which is 7. 3 + 7 = 10.",
  },
  {
    id: "q26",
    question: "How many times does this loop print 'Hello'?",
    codeSnippet: `int i = 0;
do {
    printf("Hello ");
    i++;
} while (i < 3);`,
    options: [
      { id: "opt_a", text: "2 times" },
      { id: "opt_b", text: "3 times" },
      { id: "opt_c", text: "4 times" },
      { id: "opt_d", text: "Infinite" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "i starts at 0. Iterations occur for i = 0, 1, 2 (increments to 1, 2, 3). At i = 3, condition `3 < 3` is false. Printed 3 times.",
  },
  {
    id: "q27",
    question: "What is printed by this bitwise AND operation?",
    codeSnippet: `int a = 5, b = 3;
printf("%d", a & b);`,
    options: [
      { id: "opt_a", text: "1" },
      { id: "opt_b", text: "7" },
      { id: "opt_c", text: "0" },
      { id: "opt_d", text: "2" },
    ],
    correctOptionId: "opt_a",
    points: 1,
    explanation: "5 in binary is 101_2; 3 in binary is 011_2. Bitwise AND: 101 & 011 = 001_2 = 1.",
  },
  {
    id: "q28",
    question: "What is the output of the following expression?",
    codeSnippet: `int a = 2, b = 3, c = 4;
printf("%d", a + b * c > 10);`,
    options: [
      { id: "opt_a", text: "0" },
      { id: "opt_b", text: "1" },
      { id: "opt_c", text: "14" },
      { id: "opt_d", text: "Error" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "Multiplication precedes addition: b * c = 3 * 4 = 12. Then a + 12 = 14. Relational check `14 > 10` is true (1).",
  },
  {
    id: "q29",
    question: "What will be printed?",
    codeSnippet: `int a[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};
int sum = 0;
for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 3; j++) {
        sum += a[i][j];
    }
}
printf("%d", sum);`,
    options: [
      { id: "opt_a", text: "15" },
      { id: "opt_b", text: "20" },
      { id: "opt_c", text: "21" },
      { id: "opt_d", text: "6" },
    ],
    correctOptionId: "opt_c",
    points: 1,
    explanation: "The nested loops traverse all elements of the 2x3 matrix: 1 + 2 + 3 + 4 + 5 + 6 = 21.",
  },
  {
    id: "q30",
    question: "What will fun(5) return?",
    codeSnippet: `int fun(int n) {
    if (n <= 1) return n;
    return fun(n - 1) + fun(n - 2);
}`,
    options: [
      { id: "opt_a", text: "8" },
      { id: "opt_b", text: "5" },
      { id: "opt_c", text: "3" },
      { id: "opt_d", text: "13" },
    ],
    correctOptionId: "opt_b",
    points: 1,
    explanation: "Calculates the 5th Fibonacci number: F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5.",
  },
]

export const DEFAULT_BUSINESS_QUESTIONS: ITestQuestion[] = [
  {
    id: "bq1",
    question: "Which of the following accurately describes the 'Break-Even Point' in business financial analysis?",
    options: [
      { id: "b_opt_a", text: "The point where Total Revenue equals Total Costs (zero net profit/loss)." },
      { id: "b_opt_b", text: "The point where net profit reaches its theoretical maximum." },
      { id: "b_opt_c", text: "The moment when fixed costs equal variable costs exactly." },
      { id: "b_opt_d", text: "The stage where company valuation doubles from seed stage." },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "Break-even point is reached when total revenue equals total expenses, meaning neither profit nor loss is incurred.",
  },
  {
    id: "bq2",
    question: "In classical marketing framework, what are the four fundamental 'Ps' of the Marketing Mix?",
    options: [
      { id: "b_opt_a", text: "Product, Price, Place, Promotion" },
      { id: "b_opt_b", text: "People, Process, Profit, Positioning" },
      { id: "b_opt_c", text: "Planning, Production, Packaging, Public Relations" },
      { id: "b_opt_d", text: "Pitch, Product, Profitability, Partnership" },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "E. Jerome McCarthy's 4 Ps model consists of Product, Price, Place, and Promotion.",
  },
  {
    id: "bq3",
    question: "In startup investment terminology, what is a 'Unicorn'?",
    options: [
      { id: "b_opt_a", text: "A privately held startup company valued at over $1 Billion." },
      { id: "b_opt_b", text: "A startup that records positive net cash flow within the first 6 months." },
      { id: "b_opt_c", text: "A publicly listed technology firm with zero long-term liabilities." },
      { id: "b_opt_d", text: "A company that acquires more than five competitors in one year." },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "A unicorn is a private startup company with a post-money valuation exceeding $1 billion.",
  },
  {
    id: "bq4",
    question: "What is the primary goal of adopting a 'Blue Ocean Strategy' in market positioning?",
    options: [
      { id: "b_opt_a", text: "Create uncontested market space that makes the competition irrelevant." },
      { id: "b_opt_b", text: "Aggressively undercut competitors' pricing in a saturated market." },
      { id: "b_opt_c", text: "Maximize hostile takeovers of mid-sized competing firms." },
      { id: "b_opt_d", text: "Focus exclusively on marine and renewable energy infrastructure." },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "Blue Ocean Strategy focuses on creating new demand in an untapped market space rather than fighting over existing market share.",
  },
  {
    id: "bq5",
    question: "What does the fundamental balance sheet Accounting Equation state?",
    options: [
      { id: "b_opt_a", text: "Assets = Liabilities + Shareholders' Equity" },
      { id: "b_opt_b", text: "Assets = Revenue - Operating Expenses" },
      { id: "b_opt_c", text: "Shareholders' Equity = Assets + Liabilities" },
      { id: "b_opt_d", text: "Net Profit = Total Assets - Working Capital" },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "The core foundation of double-entry bookkeeping states Assets = Liabilities + Equity.",
  },
  {
    id: "bq6",
    question: "In a corporate SWOT analysis, which two components represent internal factors?",
    options: [
      { id: "b_opt_a", text: "Strengths and Weaknesses" },
      { id: "b_opt_b", text: "Opportunities and Threats" },
      { id: "b_opt_c", text: "Strengths and Opportunities" },
      { id: "b_opt_d", text: "Weaknesses and Threats" },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "Strengths and Weaknesses are internal to an organization, while Opportunities and Threats are external market forces.",
  },
  {
    id: "bq7",
    question: "What does the startup metric 'CAC' stand for?",
    options: [
      { id: "b_opt_a", text: "Customer Acquisition Cost" },
      { id: "b_opt_b", text: "Capital Asset Consumption" },
      { id: "b_opt_c", text: "Corporate Annual Contribution" },
      { id: "b_opt_d", text: "Current Account Credit" },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "CAC stands for Customer Acquisition Cost: total marketing and sales expenditure divided by the number of new customers acquired.",
  },
  {
    id: "bq8",
    question: "A company generates $500,000 in sales revenue and has $300,000 in Cost of Goods Sold (COGS). What is its Gross Profit Margin?",
    options: [
      { id: "b_opt_a", text: "40%" },
      { id: "b_opt_b", text: "60%" },
      { id: "b_opt_c", text: "25%" },
      { id: "b_opt_d", text: "50%" },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "Gross Profit = $500,000 - $300,000 = $200,000. Margin = ($200,000 / $500,000) * 100 = 40%.",
  },
  {
    id: "bq9",
    question: "Which venture funding round typically follows the Seed / Angel round for scaling product-market fit?",
    options: [
      { id: "b_opt_a", text: "Series A" },
      { id: "b_opt_b", text: "Series D" },
      { id: "b_opt_c", text: "IPO (Initial Public Offering)" },
      { id: "b_opt_d", text: "Bridge Debt Round" },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "Series A is typically the first significant round of venture capital financing after seed funding.",
  },
  {
    id: "bq10",
    question: "What does 'EBITDA' stand for in financial reporting?",
    options: [
      { id: "b_opt_a", text: "Earnings Before Interest, Taxes, Depreciation, and Amortization" },
      { id: "b_opt_b", text: "Enterprise Balance Including Taxes, Debt, and Audit" },
      { id: "b_opt_c", text: "Equity Before Inflation, Tariffs, Debt, and Assets" },
      { id: "b_opt_d", text: "Estimated Budget Incurred Throughout Direct Activities" },
    ],
    correctOptionId: "b_opt_a",
    points: 1,
    explanation: "EBITDA measures overall financial performance and profitability before non-operating and non-cash accounting deductions.",
  },
]

export function generateCandidatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let randomPart = ""
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `HK-${randomPart}`
}

export async function seedDefaultTestIfNeeded(): Promise<any> {
  await connectToDatabase()

  // 1. CODESPRINT 2026 Test (C Quiz - 2026-10-30)
  let test1 = await Test.findOne({ testId: "codesprint-2026-c-quiz" })
  if (!test1) {
    test1 = await Test.create({
      testId: "codesprint-2026-c-quiz",
      title: "CODESPRINT 2026 - C Programming Quiz",
      eventId: "codefest-2026",
      eventTitle: "CODESPRINT 2026",
      description:
        "India's premier high-octane technical quiz on C Programming, Data Structures, and Algorithmic Thinking.",
      instructions: DEFAULT_INSTRUCTIONS,
      durationMinutes: 30,
      totalMarks: 30,
      passingMarks: 12,
      scheduledDate: "2026-10-30",
      startTime: "02:00 PM",
      endTime: "03:00 PM",
      isActive: true,
      isResultDeclared: false,
      questions: DEFAULT_QUESTIONS,
    })
  } else {
    // Always sync questions and marks to ensure the 30 new C Programming questions are loaded
    test1.questions = DEFAULT_QUESTIONS
    test1.totalMarks = 30
    test1.passingMarks = 12
    test1.instructions = DEFAULT_INSTRUCTIONS
    if (test1.isResultDeclared === true) {
      const anyEmailSent1 = await TestCandidate.exists({ testId: "codesprint-2026-c-quiz", resultEmailSent: true })
      if (!anyEmailSent1) {
        test1.isResultDeclared = false
      }
    }
    await test1.save()
  }

  // 2. BUSINESSSPRINT 2026 Test (Business Quiz - 2026-10-31)
  let test2 = await Test.findOne({ testId: "businesssprint-2026-quiz" })
  if (!test2) {
    test2 = await Test.create({
      testId: "businesssprint-2026-quiz",
      title: "BUSINESSSPRINT 2026 - Business Quiz",
      eventId: "businesssprint-2026",
      eventTitle: "BUSINESSSPRINT 2026",
      description:
        "India's premier business quiz testing knowledge across Marketing, Corporate Strategy, Financial Analysis, and Startup Ecosystem.",
      instructions: DEFAULT_INSTRUCTIONS,
      durationMinutes: 30,
      totalMarks: 10,
      passingMarks: 4,
      scheduledDate: "2026-11-02",
      startTime: "02:00 PM",
      endTime: "03:00 PM",
      isActive: true,
      isResultDeclared: false,
      questions: DEFAULT_BUSINESS_QUESTIONS,
    })
  } else if (test2.isResultDeclared === true) {
    const anyEmailSent2 = await TestCandidate.exists({ testId: "businesssprint-2026-quiz", resultEmailSent: true })
    if (!anyEmailSent2) {
      test2.isResultDeclared = false
      await test2.save()
    }
  }

  // Ensure a demo candidate is available for immediate testing
  const demoCandidate = await TestCandidate.findOne({ email: "demo@hackkro.com" })
  if (!demoCandidate) {
    await TestCandidate.create({
      testId: "codesprint-2026-c-quiz",
      eventId: "codefest-2026",
      registrationId: "REG-HK-2026-001",
      name: "Demo Candidate",
      email: "demo@hackkro.com",
      loginId: "demo@hackkro.com",
      password: "HK-DEMO-2026",
      college: "HackKro Institute of Tech",
      isEligible: true,
      status: "not-started",
    })
  }

  return test1
}

