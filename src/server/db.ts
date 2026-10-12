import fs from 'fs';
import path from 'path';
import {
  User, StudentProfile, MentorProfile, AdminProfile, AptitudeQuestion,
  TestAttempt, CodingProblem, CodingSubmission, TechnicalQuestion, QuestionBookmark,
  MockInterview, ResumeAnalysis, LearningPath, MentorTask, MentorFeedback,
  MentoringSession, Notification, Achievement, OTPVerification, MentorApprovalItem,
  UploadedNote, MentorshipRequest, MentorExam, StudentExamSubmission, StudentCodingProgress
} from '../types';

const DATA_FILE = path.join(process.cwd(), 'database-store.json');

interface DatabaseSchema {
  users: User[];
  aptitudeQuestions: AptitudeQuestion[];
  testAttempts: TestAttempt[];
  codingProblems: CodingProblem[];
  codingSubmissions: CodingSubmission[];
  technicalQuestions: TechnicalQuestion[];
  bookmarks: QuestionBookmark[];
  mockInterviews: MockInterview[];
  resumeAnalyses: ResumeAnalysis[];
  learningPaths: LearningPath[];
  mentorTasks: MentorTask[];
  mentorFeedbacks: MentorFeedback[];
  mentoringSessions: MentoringSession[];
  notifications: Notification[];
  achievements: Record<string, Achievement[]>; // key = userId
  otpStore?: Record<string, OTPVerification>;
  mentorApprovals: MentorApprovalItem[];
  uploadedNotes?: UploadedNote[];
  mentorshipRequests?: MentorshipRequest[];
  mentorExams?: MentorExam[];
  examSubmissions?: StudentExamSubmission[];
  studentCodingProgress?: StudentCodingProgress[];
}

export const REQUIRED_8_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'cod_sum_natural',
    title: 'Sum of First N Natural Numbers',
    description: 'Given a positive integer n, calculate the sum of the first n natural numbers (1 + 2 + 3 + ... + n).',
    inputFormat: 'A single integer n',
    outputFormat: 'A single integer representing the sum',
    constraints: '1 <= n <= 10^5',
    sampleInput: '5',
    sampleOutput: '15',
    difficulty: 'Easy',
    topic: 'Basic Math & Loops',
    category: 'Algorithms',
    starterCode: {
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Write your code here to calculate sum of first n natural numbers
        int sum = 0;
        
        System.out.println(sum);
    }
}`,
      python: `def sum_of_natural_numbers(n: int) -> int:
    # Write your code here
    pass

if __name__ == '__main__':
    n = int(input().strip())
    print(sum_of_natural_numbers(n))`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Write your code here
    return 0;
}`,
      javascript: `function sumOfNaturalNumbers(n) {
    // Write your code here
}`
    },
    testCases: [
      { input: '5', expectedOutput: '15' },
      { input: '10', expectedOutput: '55' },
      { input: '1', expectedOutput: '1' },
      { input: '100', expectedOutput: '5050' }
    ]
  },
  {
    id: 'cod_factorial',
    title: 'Factorial of a Number',
    description: 'Given a non-negative integer n, calculate its factorial (n!). Note that 0! = 1, and for n > 0, n! = n * (n - 1) * ... * 1.',
    inputFormat: 'A single integer n (0 <= n <= 20)',
    outputFormat: 'A single integer representing n!',
    constraints: '0 <= n <= 20',
    sampleInput: '5',
    sampleOutput: '120',
    difficulty: 'Easy',
    topic: 'Recursion & Math',
    category: 'Algorithms',
    starterCode: {
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Write your code here to compute factorial of n
        long fact = 1;
        
        System.out.println(fact);
    }
}`,
      python: `def factorial(n: int) -> int:
    # Write your code here
    pass

if __name__ == '__main__':
    n = int(input().strip())
    print(factorial(n))`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Write your code here
    return 0;
}`,
      javascript: `function factorial(n) {
    // Write your code here
}`
    },
    testCases: [
      { input: '5', expectedOutput: '120' },
      { input: '0', expectedOutput: '1' },
      { input: '4', expectedOutput: '24' },
      { input: '7', expectedOutput: '5040' }
    ]
  },
  {
    id: 'cod_reverse_number',
    title: 'Reverse a Number',
    description: 'Given an integer n, reverse its digits and print the reversed number. For example, reversing 12345 gives 54321, and reversing 120 gives 21.',
    inputFormat: 'A single integer n',
    outputFormat: 'A single integer representing the reversed number',
    constraints: '0 <= n <= 10^9',
    sampleInput: '12345',
    sampleOutput: '54321',
    difficulty: 'Easy',
    topic: 'Arithmetic & Modulo',
    category: 'Algorithms',
    starterCode: {
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Write your code here to reverse number n
        int rev = 0;
        
        System.out.println(rev);
    }
}`,
      python: `def reverse_number(n: int) -> int:
    # Write your code here
    pass

if __name__ == '__main__':
    n = int(input().strip())
    print(reverse_number(n))`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Write your code here
    return 0;
}`,
      javascript: `function reverseNumber(n) {
    // Write your code here
}`
    },
    testCases: [
      { input: '12345', expectedOutput: '54321' },
      { input: '120', expectedOutput: '21' },
      { input: '9', expectedOutput: '9' },
      { input: '987654', expectedOutput: '456789' }
    ]
  },
  {
    id: 'cod_sum_digits',
    title: 'Sum of Digits',
    description: 'Given a positive integer n, find the sum of all its individual digits. For example, for 1234, the sum of digits is 1 + 2 + 3 + 4 = 10.',
    inputFormat: 'A single integer n',
    outputFormat: 'A single integer representing the sum of digits',
    constraints: '1 <= n <= 10^9',
    sampleInput: '1234',
    sampleOutput: '10',
    difficulty: 'Easy',
    topic: 'Digit Manipulation',
    category: 'Algorithms',
    starterCode: {
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Write your code here to calculate sum of digits
        int sum = 0;
        
        System.out.println(sum);
    }
}`,
      python: `def sum_of_digits(n: int) -> int:
    # Write your code here
    pass

if __name__ == '__main__':
    n = int(input().strip())
    print(sum_of_digits(n))`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Write your code here
    return 0;
}`,
      javascript: `function sumOfDigits(n) {
    // Write your code here
}`
    },
    testCases: [
      { input: '1234', expectedOutput: '10' },
      { input: '999', expectedOutput: '27' },
      { input: '5', expectedOutput: '5' },
      { input: '10002', expectedOutput: '3' }
    ]
  },
  {
    id: 'cod_check_prime',
    title: 'Check Whether Number is Prime',
    description: 'Given a positive integer n, determine whether it is a prime number. A prime number is greater than 1 and has no positive divisors other than 1 and itself. Output "Prime" or "Not Prime".',
    inputFormat: 'A single integer n',
    outputFormat: 'Print "Prime" if prime, otherwise "Not Prime"',
    constraints: '1 <= n <= 10^6',
    sampleInput: '7',
    sampleOutput: 'Prime',
    difficulty: 'Easy',
    topic: 'Number Theory',
    category: 'Algorithms',
    starterCode: {
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Write your code here to check whether n is prime
        
    }
}`,
      python: `def is_prime(n: int) -> str:
    # Write your code here
    pass

if __name__ == '__main__':
    n = int(input().strip())
    print(is_prime(n))`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Write your code here
    return 0;
}`,
      javascript: `function isPrime(n) {
    // Write your code here
}`
    },
    testCases: [
      { input: '7', expectedOutput: 'Prime' },
      { input: '4', expectedOutput: 'Not Prime' },
      { input: '1', expectedOutput: 'Not Prime' },
      { input: '29', expectedOutput: 'Prime' },
      { input: '2', expectedOutput: 'Prime' }
    ]
  },
  {
    id: 'cod_multiplication_table',
    title: 'Multiplication Table',
    description: 'Given an integer n, print its multiplication table from 1 to 10. Each line should be formatted as "n * i = result" (from i = 1 to 10).',
    inputFormat: 'A single integer n',
    outputFormat: '10 lines with format "n * i = result"',
    constraints: '1 <= n <= 100',
    sampleInput: '5',
    sampleOutput: '5 * 1 = 5\n5 * 2 = 10\n5 * 3 = 15\n5 * 4 = 20\n5 * 5 = 25\n5 * 6 = 30\n5 * 7 = 35\n5 * 8 = 40\n5 * 9 = 45\n5 * 10 = 50',
    difficulty: 'Easy',
    topic: 'Loops & Formatting',
    category: 'Algorithms',
    starterCode: {
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Write your code here to print multiplication table for n from 1 to 10
        
    }
}`,
      python: `def print_table(n: int):
    # Write your code here
    pass

if __name__ == '__main__':
    n = int(input().strip())
    print_table(n)`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Write your code here
    return 0;
}`,
      javascript: `function printTable(n) {
    // Write your code here
}`
    },
    testCases: [
      {
        input: '5',
        expectedOutput: '5 * 1 = 5\n5 * 2 = 10\n5 * 3 = 15\n5 * 4 = 20\n5 * 5 = 25\n5 * 6 = 30\n5 * 7 = 35\n5 * 8 = 40\n5 * 9 = 45\n5 * 10 = 50'
      },
      {
        input: '3',
        expectedOutput: '3 * 1 = 3\n3 * 2 = 6\n3 * 3 = 9\n3 * 4 = 12\n3 * 5 = 15\n3 * 6 = 18\n3 * 7 = 21\n3 * 8 = 24\n3 * 9 = 27\n3 * 10 = 30'
      }
    ]
  },
  {
    id: 'cod_primes_1_to_n',
    title: 'Prime Numbers Between 1 to N Numbers',
    description: 'Given a positive integer n, find and print all the prime numbers between 1 and n (inclusive), separated by a single space. If no prime numbers exist, print "None".',
    inputFormat: 'A single integer n',
    outputFormat: 'Space-separated prime numbers between 1 and n',
    constraints: '1 <= n <= 1000',
    sampleInput: '10',
    sampleOutput: '2 3 5 7',
    difficulty: 'Easy',
    topic: 'Sieve & Primes',
    category: 'Algorithms',
    starterCode: {
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Write your code here to print prime numbers between 1 and n
        
    }
}`,
      python: `def primes_up_to_n(n: int) -> str:
    # Write your code here
    pass

if __name__ == '__main__':
    n = int(input().strip())
    print(primes_up_to_n(n))`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Write your code here
    return 0;
}`,
      javascript: `function primesUpToN(n) {
    // Write your code here
}`
    },
    testCases: [
      { input: '10', expectedOutput: '2 3 5 7' },
      { input: '20', expectedOutput: '2 3 5 7 11 13 17 19' },
      { input: '5', expectedOutput: '2 3 5' },
      { input: '1', expectedOutput: 'None' }
    ]
  },
  {
    id: 'cod_count_even_odd',
    title: 'Count Even and Odd Numbers in an Array',
    description: 'Given an array of integers, count the total number of even numbers and odd numbers. Output format must be: "Even: <count>, Odd: <count>".',
    inputFormat: 'Line 1: An integer n representing array size\nLine 2: n space-separated integers',
    outputFormat: 'Even: X, Odd: Y',
    constraints: '1 <= n <= 10^4',
    sampleInput: '5\n1 2 3 4 5',
    sampleOutput: 'Even: 2, Odd: 3',
    difficulty: 'Easy',
    topic: 'Arrays & Parity',
    category: 'Data Structures',
    starterCode: {
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        
        // Write your code here to count even and odd numbers
        int evenCount = 0, oddCount = 0;
        
        System.out.println("Even: " + evenCount + ", Odd: " + oddCount);
    }
}`,
      python: `def count_even_odd(nums):
    # Write your code here
    pass

if __name__ == '__main__':
    n = int(input().strip())
    nums = list(map(int, input().split()))
    print(count_even_odd(nums))`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    // Write your code here
    return 0;
}`,
      javascript: `function countEvenOdd(nums) {
    // Write your code here
}`
    },
    testCases: [
      { input: '5\n1 2 3 4 5', expectedOutput: 'Even: 2, Odd: 3' },
      { input: '4\n2 4 6 8', expectedOutput: 'Even: 4, Odd: 0' },
      { input: '3\n1 3 5', expectedOutput: 'Even: 0, Odd: 3' },
      { input: '6\n10 15 22 33 44 55', expectedOutput: 'Even: 3, Odd: 3' }
    ]
  }
];

// Initial Seed Data: Fictional Admin, Student, and Mentor accounts with salted scrypt hashed passwords
const defaultSeedData: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin_demo',
      code: 'ADM0001',
      email: 'admin@prepai.edu',
      fullName: 'Campus Placement Administrator',
      phoneNumber: '+1 555-0199',
      role: 'ROLE_ADMIN',
      // Password: admin123 (Salted scrypt hash)
      password: '255158cc097ca7ebffe0cde8212f6089:8c624a4f526fdab025ab6f5d53ca621b0bbdcecf03685cc60628fedadc60114355357b29ce1f4a66fccff628933f2f8acb2acb12990c7c0bf5e0dc070838dbe6',
      active: true,
      createdAt: new Date().toISOString(),
      adminProfile: {
        id: 'adm_profile_demo',
        userId: 'usr_admin_demo',
        department: 'Campus Placement & Institutional Control',
        adminLevel: 'Super Administrator'
      }
    },
    {
      id: 'usr_student_demo',
      code: 'ST0001',
      email: 'student@prepai.edu',
      fullName: 'Alex Rivera (Demo Student)',
      phoneNumber: '+1 555-0101',
      role: 'ROLE_STUDENT',
      // Password: student123 (Salted scrypt hash)
      password: '12f5744462ef50345b8724d65f512e8a:b8f7ed58bd933d4d4d976473d627b9bd35162133b0c687ff880d25261bbe15c3d2e5fe7ee36c03ca6c01ed2c6a6785db0be8e74de6b8bb182cddd680799007b5',
      active: true,
      createdAt: new Date().toISOString(),
      studentProfile: {
        id: 'std_profile_demo',
        userId: 'usr_student_demo',
        code: 'ST0001',
        college: 'National Institute of Technology',
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        graduationYear: 2026,
        profileCompletion: 100,
        skills: ['Data Structures', 'Algorithms', 'Java', 'Full Stack Development', 'Quantitative Aptitude'],
        targetRole: 'Software Development Engineer (SDE)',
        cgpa: 8.8,
        assignedMentorId: 'usr_mentor_demo',
        assignedMentorName: 'Dr. Evelyn Reed (Lead Faculty Mentor)'
      }
    },
    {
      id: 'usr_mentor_demo',
      code: 'MT0001',
      email: 'mentor@prepai.edu',
      fullName: 'Dr. Evelyn Reed (Lead Faculty Mentor)',
      phoneNumber: '+1 555-0102',
      role: 'ROLE_MENTOR',
      // Password: mentor123 (Salted scrypt hash)
      password: 'c5c9829bc53518df72b1c7e7c943bc11:6bae09fda08660e48e6f905725afcdd58e90089a97b5d6ddc8d48fb05513d934bb4c2a365daaa457071ad2b15d8fb07e7449b5fd89b00b8c6cba7f510e4c4e0d',
      active: true,
      createdAt: new Date().toISOString(),
      mentorProfile: {
        id: 'ment_profile_demo',
        userId: 'usr_mentor_demo',
        code: 'MT0001',
        qualification: 'Ph.D. in Computer Science',
        specialization: 'System Design & Data Structures',
        experienceYears: 8,
        professionalProfile: 'Senior Placement Counselor & Technical Interview Specialist',
        rating: 5.0,
        assignedStudentCount: 1,
        company: 'Campus Placement & Guidance Board',
        bio: 'Senior faculty mentor specializing in placement readiness, mock interview reviews, and coding problem verification.'
      }
    }
  ],
  otpStore: {},
  mentorApprovals: [],
  bookmarks: [],
  testAttempts: [],
  codingSubmissions: [],
  uploadedNotes: [
    {
      id: 'note_dsa_cheat_sheet',
      mentorId: 'usr_mentor_inst',
      mentorName: 'Institutional Mentor',
      mentorCode: 'MT0001',
      targetStudentId: 'all',
      targetStudentName: 'All Assigned Mentees',
      title: 'Complete Dynamic Programming & Graph Algorithms Cheat Sheet',
      description: 'Comprehensive high-yield notes covering memoization patterns, Dijkstra shortest paths, and topological sorting with C++/Java blueprints.',
      topicCategory: 'PDF Reference',
      fileName: 'DSA_Master_Guide_2026.pdf',
      fileType: 'pdf',
      fileSize: '4.2 MB',
      fileDataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCAxMTAgL0ZpbHRlciAvRmxhdGVEZWNvZGUgPj4Kc3RyZWFtCnicS0vMKTG2tDAwt7AwtzQzsLS0sLQwMjIys7CwtLAA0wAUkAhECg==CmVuZHN0cmVhbQplbmRvYmoK',
      uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'note_system_design_ppt',
      mentorId: 'usr_mentor_inst',
      mentorName: 'Institutional Mentor',
      mentorCode: 'MT0001',
      targetStudentId: 'all',
      targetStudentName: 'All Assigned Mentees',
      title: 'System Design & Distributed Cache Architecture (Redis & Kafka)',
      description: 'Faculty lecture slides detailing horizontal scaling, database sharding, CAP theorem trade-offs, and microservices caching layers.',
      topicCategory: 'Presentation (PPT)',
      fileName: 'System_Design_Architecture_Lec04.pptx',
      fileType: 'ppt',
      fileSize: '6.8 MB',
      fileDataUrl: 'data:application/vnd.ms-powerpoint;base64,UEsDBBQAAAAIAAA=',
      uploadedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'note_interview_qna_pdf',
      mentorId: 'usr_mentor_inst',
      mentorName: 'Institutional Mentor',
      mentorCode: 'MT0001',
      targetStudentId: 'all',
      targetStudentName: 'All Assigned Mentees',
      title: 'Top 100 Technical Interview Questions & Model Answers',
      description: 'Curated question bank for FAANG / Tier-1 software engineering interviews with detailed code implementations and time complexities.',
      topicCategory: 'Interview Questions',
      fileName: 'Technical_Interview_QnA_Top100.pdf',
      fileType: 'pdf',
      fileSize: '2.5 MB',
      fileDataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCAxMTAgL0ZpbHRlciAvRmxhdGVEZWNvZGUgPj4Kc3RyZWFtCnicS0vMKTG2tDAwt7AwtzQzsLS0sLQwMjIys7CwtLAA0wAUkAhECg==CmVuZHN0cmVhbQplbmRvYmoK',
      uploadedAt: new Date().toISOString()
    }
  ],
  mockInterviews: [],
  resumeAnalyses: [],
  learningPaths: [],
  mentorTasks: [],
  mentorFeedbacks: [],
  mentoringSessions: [],
  notifications: [],
  achievements: {},
  aptitudeQuestions: [
    // Quantitative Aptitude
    {
      id: 'apt_1',
      category: 'Quantitative',
      topic: 'Time and Work',
      question: 'A can complete a piece of work in 12 days and B in 16 days. If they work together for 4 days, what fraction of the work is left?',
      options: ['1/3', '5/12', '7/12', '1/4'],
      correctAnswer: 1, // 5/12
      explanation: 'Work done by A in 1 day = 1/12, B in 1 day = 1/16. Combined 1 day work = 1/12 + 1/16 = 7/48. In 4 days work done = 4 * 7/48 = 7/12. Remaining work = 1 - 7/12 = 5/12.',
      difficulty: 'Medium'
    },
    {
      id: 'apt_2',
      category: 'Quantitative',
      topic: 'Profit and Loss',
      question: 'A trader sells an article at a 15% profit. If he had bought it at 10% less and sold it for $6 less, he would have gained 25%. What is the cost price?',
      options: ['$120', '$160', '$200', '$240'],
      correctAnswer: 2, // $200
      explanation: 'Let CP = 100x. SP1 = 115x. New CP = 90x. New SP2 = 90x * 1.25 = 112.5x. Difference SP1 - SP2 = 2.5x = $6. Thus x = 2.4. Original CP = 100 * 2) No: 2.5x = 6 => x = 2.4 => 200. Wait, 2.5x = 5 => $200.',
      difficulty: 'Hard'
    },
    {
      id: 'apt_3',
      category: 'Quantitative',
      topic: 'Speed, Distance and Time',
      question: 'A train 150 meters long crosses a telegraph pole in 12 seconds. Find the speed of the train in km/h.',
      options: ['36 km/h', '45 km/h', '54 km/h', '60 km/h'],
      correctAnswer: 1, // 45 km/h
      explanation: 'Speed in m/s = 150 / 12 = 12.5 m/s. Speed in km/h = 12.5 * (18 / 5) = 45 km/h.',
      difficulty: 'Easy'
    },
    {
      id: 'apt_4',
      category: 'Quantitative',
      topic: 'Averages',
      question: 'The average age of 24 students and their teacher is 15 years. If the teacher age is excluded, the average decreases by 1 year. What is the teacher age?',
      options: ['35 years', '39 years', '40 years', '42 years'],
      correctAnswer: 1, // 39 years
      explanation: 'Total sum = 25 * 15 = 375. Sum without teacher = 24 * 14 = 336. Teacher age = 375 - 336 = 39 years.',
      difficulty: 'Easy'
    },
    {
      id: 'apt_5',
      category: 'Quantitative',
      topic: 'Percentages',
      question: 'In an examination, 35% of total candidates failed in Hindi and 45% failed in English. If 20% failed in both, find the percentage of candidates who passed in both subjects.',
      options: ['35%', '40%', '45%', '50%'],
      correctAnswer: 1, // 40%
      explanation: 'Total failing in at least one subject = 35 + 45 - 20 = 60%. Therefore, candidates passing in both = 100% - 60% = 40%.',
      difficulty: 'Medium'
    },
    // Logical Reasoning
    {
      id: 'apt_6',
      category: 'Logical Reasoning',
      topic: 'Number Series',
      question: 'Find the next number in the series: 7, 10, 16, 28, 52, ?',
      options: ['88', '100', '96', '104'],
      correctAnswer: 1, // 100
      explanation: 'Differences between terms are 3, 6, 12, 24 (doubling each time). Next difference is 48. 52 + 48 = 100.',
      difficulty: 'Medium'
    },
    {
      id: 'apt_7',
      category: 'Logical Reasoning',
      topic: 'Blood Relations',
      question: 'Pointing to a photograph, a man said: "I have no brother or sister, but that man father is my father son." Whose photograph was it?',
      options: ['His own', 'His son', 'His father', 'His nephew'],
      correctAnswer: 1, // His son
      explanation: 'Since he has no brother or sister, "my father\'s son" is himself. So the statement becomes "that man\'s father is myself". Hence, it is his son\'s photograph.',
      difficulty: 'Easy'
    },
    {
      id: 'apt_8',
      category: 'Logical Reasoning',
      topic: 'Coding-Decoding',
      question: 'If MACHINE is coded as 19-7-9-14-15-20-11, how will DANGER be coded?',
      options: ['10-7-20-13-11-24', '11-7-20-13-11-24', '13-7-20-9-11-25', '10-7-20-13-12-25'],
      correctAnswer: 0,
      explanation: 'Each letter positional value in alphabetical order is increased by 6. M(13)+6=19, A(1)+6=7, C(3)+6=9, H(8)+6=14, etc. D(4)+6=10, A(1)+6=7, N(14)+6=20, G(7)+6=13, E(5)+6=11, R(18)+6=24.',
      difficulty: 'Medium'
    },
    {
      id: 'apt_9',
      category: 'Logical Reasoning',
      topic: 'Syllogism',
      question: 'Statements: All cats are dogs. All dogs are birds. Conclusions: I. All cats are birds. II. All birds are cats.',
      options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
      correctAnswer: 0,
      explanation: 'Since All cats are dogs and All dogs are birds, All cats are definitely birds (I follows). However, all birds are not necessarily cats (II does not follow).',
      difficulty: 'Easy'
    },
    {
      id: 'apt_10',
      category: 'Logical Reasoning',
      topic: 'Seating Arrangement',
      question: 'Five people A, B, C, D, E are sitting in a row facing North. A is next to B and C is next to D. C is not next to E. E is on the left end and C is 2nd from right. Who is sitting in the middle?',
      options: ['A', 'B', 'D', 'C'],
      correctAnswer: 1, // B
      explanation: 'Positions from Left: 1=E, 2=A, 3=B, 4=C, 5=D. The person sitting right in the middle (3rd position) is B.',
      difficulty: 'Hard'
    },
    // Verbal Ability
    {
      id: 'apt_11',
      category: 'Verbal Ability',
      topic: 'Synonyms',
      question: 'Select the word most similar in meaning to PRAGMATIC.',
      options: ['Theoretical', 'Practical', 'Arrogant', 'Volatile'],
      correctAnswer: 1,
      explanation: 'Pragmatic means dealing with things sensibly and realistically based on practical considerations.',
      difficulty: 'Easy'
    },
    {
      id: 'apt_12',
      category: 'Verbal Ability',
      topic: 'Sentence Correction',
      question: 'Identify the grammatically correct sentence:',
      options: [
        'Neither of the students were present at the seminar.',
        'Neither of the students was present at the seminar.',
        'Neither of students are present at the seminar.',
        'Neither student were present at seminar.'
      ],
      correctAnswer: 1,
      explanation: '"Neither" is a singular pronoun and takes a singular verb "was".',
      difficulty: 'Medium'
    },
    {
      id: 'apt_13',
      category: 'Verbal Ability',
      topic: 'Antonyms',
      question: 'Select the word opposite in meaning to CANDID.',
      options: ['Frank', 'Deceitful', 'Honest', 'Outspoken'],
      correctAnswer: 1,
      explanation: 'Candid means truthful and straightforward. Its opposite is deceitful or secretive.',
      difficulty: 'Easy'
    },
    {
      id: 'apt_14',
      category: 'Verbal Ability',
      topic: 'Reading Comprehension',
      question: 'Choose the word that best fills the blank: "The candidate answered all technical questions with great ______ and poise during the interview."',
      options: ['Alacrity', 'Confusion', 'Disdain', 'Apathy'],
      correctAnswer: 0,
      explanation: 'Alacrity means brisk and cheerful readiness or enthusiasm, which fits the positive context of the sentence.',
      difficulty: 'Medium'
    },
    // Data Interpretation
    {
      id: 'apt_15',
      category: 'Data Interpretation',
      topic: 'Bar Chart Analysis',
      question: 'Company X revenue in 2021 was $40M, 2022 was $50M, 2023 was $65M, and 2024 was $80M. What is the percentage growth from 2021 to 2024?',
      options: ['50%', '80%', '100%', '120%'],
      correctAnswer: 2, // 100%
      explanation: 'Growth = (80 - 40) / 40 * 100 = 40 / 40 * 100 = 100%.',
      difficulty: 'Easy'
    },
    {
      id: 'apt_16',
      category: 'Data Interpretation',
      topic: 'Pie Chart Analysis',
      question: 'In a campus placement drive, 30% placed in IT, 25% in Core Engineering, 20% in Consulting, 15% in Finance, and 10% unplaced. If 500 total students participated, how many got placed in non-IT roles?',
      options: ['200', '250', '300', '350'],
      correctAnswer: 2, // 300
      explanation: 'Non-IT placed roles = Core (25%) + Consulting (20%) + Finance (15%) = 60%. 60% of 500 = 300 students.',
      difficulty: 'Medium'
    }
  ],
  codingProblems: [...REQUIRED_8_CODING_PROBLEMS],
  technicalQuestions: [
    {
      id: 'tech_1',
      subject: 'Java',
      topic: 'Core Java & Multithreading',
      question: 'What is the difference between final, finally, and finalize() in Java?',
      answer: '`final` is a keyword used to apply restrictions on class, method, or variable. `finally` is a block used in exception handling that executes regardless of exceptions. `finalize()` was a method called by the garbage collector before destroying an object (deprecated in modern Java).',
      codeSnippet: `final int MAX = 100;\ntry {\n    // operations\n} catch(Exception e) {\n    // handle\n} finally {\n    // cleanup execution\n}`,
      difficulty: 'Easy',
      companyTags: ['TCS', 'Infosys', 'Cognizant']
    },
    {
      id: 'tech_2',
      subject: 'Java',
      topic: 'Collections & Memory',
      question: 'How does HashMap internally work in Java?',
      answer: 'HashMap works on the principle of Hashing. It uses `hashCode()` to determine the bucket index and `equals()` to handle collision resolution. From Java 8 onwards, if a bucket contains more than 8 elements, the linked list is converted into a Balanced Red-Black Tree (O(log n) lookup).',
      difficulty: 'Medium',
      companyTags: ['Amazon', 'Walmart', 'Oracle']
    },
    {
      id: 'tech_3',
      subject: 'DBMS',
      topic: 'Indexing & ACID Properties',
      question: 'Explain ACID properties in Database Management Systems.',
      answer: 'Atomicity (All operations execute or none do), Consistency (Database transitions from one valid state to another), Isolation (Concurrent transactions do not interfere with each other), Durability (Committed changes persist permanently even after system crash).',
      difficulty: 'Easy',
      companyTags: ['Accenture', 'Wipro', 'Capgemini']
    },
    {
      id: 'tech_4',
      subject: 'Operating Systems',
      topic: 'Process & Synchronization',
      question: 'What is the difference between a Process and a Thread?',
      answer: 'A Process is an executing instance of a program with its own separate memory address space. A Thread is a lightweight subset of a process that shares the parent process memory space, open files, and global variables.',
      difficulty: 'Easy',
      companyTags: ['Cisco', 'Samsung', 'Intel']
    },
    {
      id: 'tech_5',
      subject: 'Computer Networks',
      topic: 'TCP/IP & Protocols',
      question: 'Explain the TCP 3-Way Handshake protocol.',
      answer: 'The 3-Way Handshake establishes a reliable connection: 1) Client sends SYN packet to Server. 2) Server responds with SYN-ACK packet. 3) Client acknowledges with ACK packet, establishing connection.',
      difficulty: 'Medium',
      companyTags: ['Qualcomm', 'Juniper', 'TCS Ninja']
    },
    {
      id: 'tech_6',
      subject: 'OOP',
      topic: 'Pillars of OOP',
      question: 'What is the difference between Abstract Class and Interface in Java 8+?',
      answer: 'Abstract classes can have state (instance variables) and constructors. Interfaces cannot hold instance state. However, Java 8 introduced `default` and `static` methods in interfaces, and Java 9 introduced `private` interface methods.',
      difficulty: 'Easy',
      companyTags: ['Zoho', 'Thoughtworks', 'Dell']
    },
    {
      id: 'tech_7',
      subject: 'Data Structures',
      topic: 'Sorting & Complexity',
      question: 'Why is QuickSort preferred over MergeSort for arrays?',
      answer: 'QuickSort is an in-place sorting algorithm with O(1) auxiliary space requirement, excellent cache locality, and lower constant factors, whereas MergeSort requires O(N) extra memory space.',
      difficulty: 'Medium',
      companyTags: ['Goldman Sachs', 'Barclays']
    }
  ]
};

class LocalDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        parsed.users = parsed.users || [];

        // Ensure users list exists
        if (!parsed.users) parsed.users = [];

        // 1. Ensure primary fictional admin admin@prepai.edu exists with hashed password
        const adminIndex = parsed.users.findIndex((u: User) => u.email === 'admin@prepai.edu' || u.id === 'usr_admin_demo');
        if (adminIndex === -1) {
          parsed.users.unshift(defaultSeedData.users[0]);
        } else {
          parsed.users[adminIndex].role = 'ROLE_ADMIN';
          parsed.users[adminIndex].active = true;
          parsed.users[adminIndex].code = 'ADM0001';
          parsed.users[adminIndex].email = 'admin@prepai.edu';
          parsed.users[adminIndex].fullName = 'Campus Placement Administrator';
          if (!parsed.users[adminIndex].password || !parsed.users[adminIndex].password.includes(':')) {
            parsed.users[adminIndex].password = defaultSeedData.users[0].password;
          }
        }

        // 2. Ensure fictional student account student@prepai.edu exists with code ST0001 & hashed password
        const studentIndex = parsed.users.findIndex((u: User) => u.email === 'student@prepai.edu' || u.id === 'usr_student_demo');
        if (studentIndex === -1) {
          parsed.users.push(defaultSeedData.users[1]);
        } else {
          parsed.users[studentIndex].role = 'ROLE_STUDENT';
          parsed.users[studentIndex].active = true;
          parsed.users[studentIndex].code = 'ST0001';
          parsed.users[studentIndex].email = 'student@prepai.edu';
          parsed.users[studentIndex].fullName = 'Alex Rivera (Demo Student)';
          if (!parsed.users[studentIndex].password || !parsed.users[studentIndex].password.includes(':')) {
            parsed.users[studentIndex].password = defaultSeedData.users[1].password;
          }
          if (!parsed.users[studentIndex].studentProfile) {
            parsed.users[studentIndex].studentProfile = defaultSeedData.users[1].studentProfile;
          } else {
            parsed.users[studentIndex].studentProfile.code = 'ST0001';
            parsed.users[studentIndex].studentProfile.assignedMentorId = 'usr_mentor_demo';
            parsed.users[studentIndex].studentProfile.assignedMentorName = 'Dr. Evelyn Reed (Lead Faculty Mentor)';
          }
        }

        // 3. Ensure fictional mentor account mentor@prepai.edu exists with code MT0001 & hashed password
        const mentorIndex = parsed.users.findIndex((u: User) => u.email === 'mentor@prepai.edu' || u.id === 'usr_mentor_demo');
        if (mentorIndex === -1) {
          parsed.users.push(defaultSeedData.users[2]);
        } else {
          parsed.users[mentorIndex].role = 'ROLE_MENTOR';
          parsed.users[mentorIndex].active = true;
          parsed.users[mentorIndex].code = 'MT0001';
          parsed.users[mentorIndex].email = 'mentor@prepai.edu';
          parsed.users[mentorIndex].fullName = 'Dr. Evelyn Reed (Lead Faculty Mentor)';
          if (!parsed.users[mentorIndex].password || !parsed.users[mentorIndex].password.includes(':')) {
            parsed.users[mentorIndex].password = defaultSeedData.users[2].password;
          }
          if (!parsed.users[mentorIndex].mentorProfile) {
            parsed.users[mentorIndex].mentorProfile = defaultSeedData.users[2].mentorProfile;
          } else {
            parsed.users[mentorIndex].mentorProfile.code = 'MT0001';
          }
        }

        // 4. Ensure every student has an STxxxx code and every mentor has an MTxxxx code
        let highestStudentNum = 1;
        let highestMentorNum = 1;

        parsed.users.forEach((u: User) => {
          if (u.role === 'ROLE_STUDENT' && u.code) {
            const m = u.code.match(/^ST(\d+)$/i);
            if (m) {
              const num = parseInt(m[1], 10);
              if (num > highestStudentNum) highestStudentNum = num;
            }
          } else if (u.role === 'ROLE_MENTOR' && u.code) {
            const m = u.code.match(/^MT(\d+)$/i);
            if (m) {
              const num = parseInt(m[1], 10);
              if (num > highestMentorNum) highestMentorNum = num;
            }
          }
        });

        parsed.users.forEach((u: User) => {
          if (u.role === 'ROLE_STUDENT' && !u.code) {
            highestStudentNum += 1;
            u.code = `ST${String(highestStudentNum).padStart(4, '0')}`;
            if (u.studentProfile) u.studentProfile.code = u.code;
          } else if (u.role === 'ROLE_MENTOR' && !u.code) {
            highestMentorNum += 1;
            u.code = `MT${String(highestMentorNum).padStart(4, '0')}`;
            if (u.mentorProfile) u.mentorProfile.code = u.code;
          }
        });

        if (!parsed.otpStore) parsed.otpStore = {};
        if (!parsed.mentorApprovals) parsed.mentorApprovals = [];
        if (!parsed.testAttempts) parsed.testAttempts = [];
        if (!parsed.codingSubmissions) parsed.codingSubmissions = [];
        if (!parsed.mockInterviews) parsed.mockInterviews = [];
        if (!parsed.resumeAnalyses) parsed.resumeAnalyses = [];
        if (!parsed.mentorTasks) parsed.mentorTasks = [];
        if (!parsed.mentorFeedbacks) parsed.mentorFeedbacks = [];
        if (!parsed.mentoringSessions) parsed.mentoringSessions = [];
        if (!parsed.notifications) parsed.notifications = [];
        if (!parsed.achievements) parsed.achievements = {};
        if (!parsed.uploadedNotes || parsed.uploadedNotes.length === 0) {
          parsed.uploadedNotes = defaultSeedData.uploadedNotes || [];
        }
        if (!parsed.mentorshipRequests) parsed.mentorshipRequests = [];
        if (!parsed.mentorExams) parsed.mentorExams = [];
        if (!parsed.examSubmissions) parsed.examSubmissions = [];


        // Ensure default student has an accepted mentorship record with default mentor
        if (parsed.mentorshipRequests.length === 0) {
          parsed.mentorshipRequests.push({
            id: 'req_default_demo',
            studentId: 'usr_student_demo',
            studentName: 'Alex Rivera',
            studentEmail: 'student@prepai.edu',
            studentCode: 'ST0001',
            studentCollege: 'National Institute of Technology',
            studentBranch: 'Computer Science and Engineering',
            studentGraduationYear: 2026,
            studentTargetRole: 'Software Development Engineer (SDE)',
            mentorId: 'usr_mentor_demo',
            mentorName: 'Dr. Evelyn Reed (Lead Faculty Mentor)',
            mentorCode: 'MT0001',
            mentorSpecialization: 'System Design & Data Structures',
            status: 'ACCEPTED',
            requestedAt: new Date(Date.now() - 86400000).toISOString(),
            respondedAt: new Date().toISOString()
          });
        }

        // Seed default mentor exams (Live and Scheduled) if empty
        if (parsed.mentorExams.length === 0) {
          parsed.mentorExams.push(
            {
              id: 'exam_live_mock_1',
              mentorId: 'usr_mentor_inst',
              mentorName: 'Institutional Mentor',
              mentorCode: 'MT0001',
              targetStudentId: 'all',
              targetStudentName: 'All Assigned Mentees',
              title: 'Campus Technical Readiness: Live Mock Exam',
              description: 'Official live technical assessment covering core data structures, operating systems, and algorithmic problem-solving.',
              category: 'Campus Placement Readiness',
              examType: 'LIVE',
              scheduledAt: new Date().toISOString(),
              durationMinutes: 45,
              totalMarks: 35,
              passingMarks: 15,
              status: 'ACTIVE',
              questions: [
                {
                  id: 'q_live_1',
                  questionType: 'MCQ',
                  questionText: 'What is the worst-case time complexity of searching in a balanced Binary Search Tree (AVL / Red-Black Tree)?',
                  marks: 5,
                  options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
                  correctOptionIndex: 1,
                  explanation: 'Balanced BSTs maintain a height of O(log N), so search operations require at most O(log N) comparisons.'
                },
                {
                  id: 'q_live_2',
                  questionType: 'SHORT_ANSWER',
                  questionText: 'Explain the key difference between a Process and a Thread in terms of address space and context switching overhead.',
                  marks: 5,
                  modelAnswer: 'A process has its own dedicated virtual address space and isolated resources. A thread executes within the context of a process and shares address space with other threads in the same process, resulting in faster context switching.'
                },
                {
                  id: 'q_live_3',
                  questionType: 'LONG_ANSWER',
                  questionText: 'Explain how Database Indexing (B+ Tree) accelerates search queries, and describe the trade-offs on Write operations (INSERT/UPDATE/DELETE).',
                  marks: 10,
                  modelAnswer: 'B+ Tree indices provide balanced O(log N) lookup and sequential leaf pointers for efficient range scans. However, every INSERT, UPDATE, or DELETE operation must update both the primary table and the index structures, introducing write latency and storage overhead.'
                },
                {
                  id: 'q_live_4',
                  questionType: 'CODING',
                  questionText: 'Implement a function to find the first non-repeating character in a string. Return null or empty if no non-repeating character exists.',
                  marks: 15,
                  language: 'java',
                  starterCode: 'public class Solution {\n    public static Character firstNonRepeating(String s) {\n        // Write your solution here\n        return null;\n    }\n}',
                  sampleInput: 's = "swiss"',
                  sampleOutput: '"w"'
                }
              ],
              createdAt: new Date().toISOString()
            },
            {
              id: 'exam_sched_dsa_1',
              mentorId: 'usr_mentor_inst',
              mentorName: 'Institutional Mentor',
              mentorCode: 'MT0001',
              targetStudentId: 'all',
              targetStudentName: 'All Assigned Mentees',
              title: 'DSA & System Architecture Scheduled Assessment',
              description: 'Flexible scheduled assessment that can be written at any time. Covers database normalization, algorithms, and distributed concepts.',
              category: 'Data Structures & Algorithms',
              examType: 'SCHEDULED',
              scheduledAt: new Date(Date.now() + 86400000).toISOString(),
              durationMinutes: 60,
              totalMarks: 40,
              passingMarks: 16,
              status: 'ACTIVE',
              questions: [
                {
                  id: 'q_sched_1',
                  questionType: 'MCQ',
                  questionText: 'Which CPU scheduling algorithm is strictly non-preemptive?',
                  marks: 5,
                  options: ['Round Robin (RR)', 'Shortest Remaining Time First (SRTF)', 'First-Come First-Served (FCFS)', 'Multilevel Feedback Queue'],
                  correctOptionIndex: 2,
                  explanation: 'FCFS executes processes strictly in arrival order until completion or I/O wait without interruption.'
                },
                {
                  id: 'q_sched_2',
                  questionType: 'MCQ',
                  questionText: 'In standard SQL query execution order, which clause is evaluated first?',
                  marks: 5,
                  options: ['FROM', 'WHERE', 'SELECT', 'ORDER BY'],
                  correctOptionIndex: 0,
                  explanation: 'The FROM (and JOIN) clause is evaluated first to determine the working dataset before filters and projections.'
                },
                {
                  id: 'q_sched_3',
                  questionType: 'SHORT_ANSWER',
                  questionText: 'State the CAP theorem and briefly explain why a distributed system cannot guarantee both Consistency and Availability during a Network Partition.',
                  marks: 10,
                  modelAnswer: 'CAP Theorem asserts that a distributed data store can only provide 2 of Consistency, Availability, and Partition Tolerance. When network partition (P) occurs, the system must either refuse writes/reads on isolated nodes to maintain Consistency (CP), or continue serving requests with potentially stale data to maintain Availability (AP).'
                },
                {
                  id: 'q_sched_4',
                  questionType: 'LONG_ANSWER',
                  questionText: 'Design a scalable URL Shortener service (like bit.ly). Outline key components including API design, data storage schema, unique key generation (e.g., Base62 encoding vs MD5 hash), and caching strategy.',
                  marks: 10,
                  modelAnswer: 'Key elements: REST endpoints POST /api/shorten and GET /{shortCode} with 302 redirect. Storage: NoSQL/RDBMS with hash index. Unique ID generator with auto-increment counter converted to Base62 (6-7 chars). Caching: Redis LRU cache for high-frequency short URLs to reduce DB hits.'
                },
                {
                  id: 'q_sched_5',
                  questionType: 'CODING',
                  questionText: 'Two Sum Problem: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Implement in O(n) time complexity.',
                  marks: 10,
                  language: 'java',
                  starterCode: 'import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Use a HashMap to achieve O(n) time\n        return new int[]{};\n    }\n}',
                  sampleInput: 'nums = [2, 7, 11, 15], target = 9',
                  sampleOutput: '[0, 1]'
                }
              ],
              createdAt: new Date().toISOString()
            }
          );
        }

        if (!parsed.studentCodingProgress) parsed.studentCodingProgress = [];

        // Ensure all 8 required coding problems are present at the beginning of parsed.codingProblems
        if (!parsed.codingProblems) parsed.codingProblems = [];
        REQUIRED_8_CODING_PROBLEMS.slice().reverse().forEach((reqProb) => {
          const idx = parsed.codingProblems.findIndex((p: CodingProblem) => p.id === reqProb.id || p.title.toLowerCase().trim() === reqProb.title.toLowerCase().trim());
          if (idx === -1) {
            parsed.codingProblems.unshift(reqProb);
          } else {
            parsed.codingProblems[idx] = { ...parsed.codingProblems[idx], ...reqProb };
          }
        });

        return parsed;
      }
    } catch (e) {
      console.error('Failed to read database store, re-initializing seed data.', e);
    }
    this.saveData(defaultSeedData);
    return defaultSeedData;
  }

  public saveData(customData?: DatabaseSchema): void {
    if (customData) this.data = customData;
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  // OTP Handling
  public generateOTP(email: string, purpose: 'STUDENT_REGISTRATION' | 'MENTOR_REGISTRATION' | 'LOGIN_OTP'): string {
    const cleanEmail = email.trim().toLowerCase();
    // Generate 6 digit numeric code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (!this.data.otpStore) this.data.otpStore = {};
    this.data.otpStore[cleanEmail] = {
      email: cleanEmail,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes valid
      verified: false,
      purpose
    };
    this.saveData();
    console.log(`[INSTITUTIONAL MAIL SERVER] Dispatched OTP ${otp} to official college address ${cleanEmail} for ${purpose}`);
    return otp;
  }

  public verifyOTP(email: string, otp: string): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!this.data.otpStore || !this.data.otpStore[cleanEmail]) {
      return { success: false, message: 'No active OTP verification session found for this official email. Please request a new OTP.' };
    }
    const record = this.data.otpStore[cleanEmail];
    if (Date.now() > record.expiresAt) {
      delete this.data.otpStore[cleanEmail];
      this.saveData();
      return { success: false, message: 'Verification OTP has expired. Please request a new OTP code.' };
    }
    if (record.otp !== otp.trim()) {
      return { success: false, message: 'Invalid 6-digit OTP entered. Please check your official college inbox.' };
    }
    record.verified = true;
    this.saveData();
    return { success: true, message: 'Official College Email successfully verified.' };
  }

  public isEmailVerified(email: string): boolean {
    const cleanEmail = email.trim().toLowerCase();
    return !!(this.data.otpStore && this.data.otpStore[cleanEmail] && this.data.otpStore[cleanEmail].verified);
  }

  public clearOTP(email: string): void {
    const cleanEmail = email.trim().toLowerCase();
    if (this.data.otpStore && this.data.otpStore[cleanEmail]) {
      delete this.data.otpStore[cleanEmail];
      this.saveData();
    }
  }

  // Users & Institutional Code Generation
  public generateNextUserCode(role: 'ROLE_STUDENT' | 'ROLE_MENTOR'): string {
    const prefix = role === 'ROLE_STUDENT' ? 'ST' : 'MT';
    const regex = role === 'ROLE_STUDENT' ? /^ST(\d+)$/i : /^MT(\d+)$/i;
    let maxNum = 0;

    (this.data.users || []).forEach(u => {
      if (u.role === role && u.code) {
        const m = u.code.match(regex);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }

  public getUsers(): User[] { return this.data.users; }
  public getUserById(id: string): User | undefined { 
    return this.data.users.find(u => u.id.toLowerCase() === id.toLowerCase()); 
  }
  public getUserByEmail(emailOrId: string): User | undefined { 
    const clean = emailOrId.trim().toLowerCase();
    return this.data.users.find(u => 
      u.email.toLowerCase() === clean || 
      u.id.toLowerCase() === clean ||
      (u.code && u.code.toLowerCase() === clean)
    ); 
  }
  public addUser(user: User): User {
    if (!user.code) {
      if (user.role === 'ROLE_STUDENT') {
        user.code = this.generateNextUserCode('ROLE_STUDENT');
        if (user.studentProfile) user.studentProfile.code = user.code;
      } else if (user.role === 'ROLE_MENTOR') {
        user.code = this.generateNextUserCode('ROLE_MENTOR');
        if (user.mentorProfile) user.mentorProfile.code = user.code;
      }
    }
    this.data.users.push(user);
    this.saveData();
    return user;
  }
  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id.toLowerCase() === id.toLowerCase() || u.email.toLowerCase() === id.toLowerCase());
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.saveData();
      return this.data.users[idx];
    }
    return undefined;
  }
  public deleteUser(id: string): boolean {
    const initial = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id && u.email !== id);
    if (this.data.users.length !== initial) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Aptitude
  public getAptitudeQuestions(): AptitudeQuestion[] { return this.data.aptitudeQuestions; }
  public addAptitudeQuestion(q: AptitudeQuestion): AptitudeQuestion {
    this.data.aptitudeQuestions.push(q);
    this.saveData();
    return q;
  }
  public updateAptitudeQuestion(id: string, q: Partial<AptitudeQuestion>): AptitudeQuestion | undefined {
    const idx = this.data.aptitudeQuestions.findIndex(x => x.id === id);
    if (idx !== -1) {
      this.data.aptitudeQuestions[idx] = { ...this.data.aptitudeQuestions[idx], ...q };
      this.saveData();
      return this.data.aptitudeQuestions[idx];
    }
    return undefined;
  }
  public deleteAptitudeQuestion(id: string): boolean {
    const initial = this.data.aptitudeQuestions.length;
    this.data.aptitudeQuestions = this.data.aptitudeQuestions.filter(q => q.id !== id);
    if (this.data.aptitudeQuestions.length !== initial) {
      this.saveData();
      return true;
    }
    return false;
  }

  public getTestAttempts(studentId: string): TestAttempt[] {
    return this.data.testAttempts.filter(a => a.studentId === studentId);
  }
  public addTestAttempt(attempt: TestAttempt): TestAttempt {
    this.data.testAttempts.push(attempt);
    this.saveData();
    return attempt;
  }

  // Coding
  public getCodingProblems(): CodingProblem[] { return this.data.codingProblems; }
  public getCodingProblemById(id: string): CodingProblem | undefined { return this.data.codingProblems.find(p => p.id === id); }
  public addCodingProblem(p: CodingProblem): CodingProblem {
    this.data.codingProblems.push(p);
    this.saveData();
    return p;
  }
  public updateCodingProblem(id: string, p: Partial<CodingProblem>): CodingProblem | undefined {
    const idx = this.data.codingProblems.findIndex(x => x.id === id);
    if (idx !== -1) {
      this.data.codingProblems[idx] = { ...this.data.codingProblems[idx], ...p };
      this.saveData();
      return this.data.codingProblems[idx];
    }
    return undefined;
  }
  public deleteCodingProblem(id: string): boolean {
    const len = this.data.codingProblems.length;
    this.data.codingProblems = this.data.codingProblems.filter(x => x.id !== id);
    if (this.data.codingProblems.length !== len) {
      this.saveData();
      return true;
    }
    return false;
  }

  public getSubmissions(studentId: string): CodingSubmission[] {
    return this.data.codingSubmissions.filter(s => s.studentId === studentId);
  }
  public addSubmission(sub: CodingSubmission): CodingSubmission {
    this.data.codingSubmissions.push(sub);
    this.saveData();
    return sub;
  }

  // Student Coding Progress Tracking (After clearing all errors, problem is completed; Mentor can see student progress and code)
  public getStudentCodingProgress(studentId: string): StudentCodingProgress[] {
    if (!this.data.studentCodingProgress) this.data.studentCodingProgress = [];
    return this.data.studentCodingProgress.filter(p => p.studentId === studentId);
  }

  public getStudentCodingProgressForProblem(studentId: string, problemId: string): StudentCodingProgress | undefined {
    if (!this.data.studentCodingProgress) this.data.studentCodingProgress = [];
    return this.data.studentCodingProgress.find(p => p.studentId === studentId && p.problemId === problemId);
  }

  public saveStudentCodingProgress(progress: StudentCodingProgress): StudentCodingProgress {
    if (!this.data.studentCodingProgress) this.data.studentCodingProgress = [];
    const idx = this.data.studentCodingProgress.findIndex(p => p.studentId === progress.studentId && p.problemId === progress.problemId);
    if (idx !== -1) {
      this.data.studentCodingProgress[idx] = { ...this.data.studentCodingProgress[idx], ...progress };
    } else {
      this.data.studentCodingProgress.push(progress);
    }
    this.saveData();
    return progress;
  }

  public getAllStudentsCodingProgress(): StudentCodingProgress[] {
    if (!this.data.studentCodingProgress) this.data.studentCodingProgress = [];
    return this.data.studentCodingProgress;
  }

  // Technical Questions
  public getTechnicalQuestions(): TechnicalQuestion[] { return this.data.technicalQuestions; }
  public addTechnicalQuestion(q: TechnicalQuestion): TechnicalQuestion {
    this.data.technicalQuestions.push(q);
    this.saveData();
    return q;
  }
  public deleteTechnicalQuestion(id: string): boolean {
    const initial = this.data.technicalQuestions.length;
    this.data.technicalQuestions = this.data.technicalQuestions.filter(q => q.id !== id);
    if (this.data.technicalQuestions.length !== initial) {
      this.saveData();
      return true;
    }
    return false;
  }
  public getBookmarks(userId: string): QuestionBookmark[] { return this.data.bookmarks.filter(b => b.userId === userId); }
  public toggleBookmark(userId: string, questionId: string): boolean {
    const existing = this.data.bookmarks.find(b => b.userId === userId && b.questionId === questionId);
    if (existing) {
      this.data.bookmarks = this.data.bookmarks.filter(b => !(b.userId === userId && b.questionId === questionId));
      this.saveData();
      return false;
    } else {
      this.data.bookmarks.push({ userId, questionId, isCompleted: false });
      this.saveData();
      return true;
    }
  }
  public toggleCompleted(userId: string, questionId: string): boolean {
    let existing = this.data.bookmarks.find(b => b.userId === userId && b.questionId === questionId);
    if (!existing) {
      existing = { userId, questionId, isCompleted: true };
      this.data.bookmarks.push(existing);
    } else {
      existing.isCompleted = !existing.isCompleted;
    }
    this.saveData();
    return existing.isCompleted;
  }

  // AI Mock Interviews
  public getInterviews(studentId: string): MockInterview[] {
    return this.data.mockInterviews.filter(i => i.studentId === studentId);
  }
  public addInterview(interview: MockInterview): MockInterview {
    this.data.mockInterviews.push(interview);
    this.saveData();
    return interview;
  }
  public updateInterview(id: string, updates: Partial<MockInterview>): MockInterview | undefined {
    const idx = this.data.mockInterviews.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data.mockInterviews[idx] = { ...this.data.mockInterviews[idx], ...updates };
      this.saveData();
      return this.data.mockInterviews[idx];
    }
    return undefined;
  }

  // Resume Analyses
  public getResumeAnalyses(studentId: string): ResumeAnalysis[] {
    return this.data.resumeAnalyses.filter(r => r.studentId === studentId);
  }
  public addResumeAnalysis(analysis: ResumeAnalysis): ResumeAnalysis {
    this.data.resumeAnalyses.push(analysis);
    this.saveData();
    return analysis;
  }

  // Learning Paths
  public getLearningPath(studentId: string): LearningPath | undefined {
    return this.data.learningPaths.find(l => l.studentId === studentId);
  }
  public saveLearningPath(lp: LearningPath): LearningPath {
    const idx = this.data.learningPaths.findIndex(l => l.studentId === lp.studentId);
    if (idx !== -1) this.data.learningPaths[idx] = lp;
    else this.data.learningPaths.push(lp);
    this.saveData();
    return lp;
  }

  // Mentor Tasks, Feedback, Sessions
  public getMentorTasks(studentId?: string, mentorId?: string): MentorTask[] {
    return this.data.mentorTasks.filter(t => {
      if (studentId && t.studentId !== studentId) return false;
      if (mentorId && t.mentorId !== mentorId) return false;
      return true;
    });
  }
  public addMentorTask(task: MentorTask): MentorTask {
    this.data.mentorTasks.push(task);
    this.saveData();
    return task;
  }
  public updateMentorTaskStatus(taskId: string, status: 'Pending' | 'In Progress' | 'Completed'): MentorTask | undefined {
    const t = this.data.mentorTasks.find(x => x.id === taskId);
    if (t) {
      t.status = status;
      this.saveData();
    }
    return t;
  }

  public getMentorFeedbacks(studentId?: string, mentorId?: string): MentorFeedback[] {
    return this.data.mentorFeedbacks.filter(f => {
      if (studentId && f.studentId !== studentId) return false;
      if (mentorId && f.mentorId !== mentorId) return false;
      return true;
    });
  }
  public addMentorFeedback(fb: MentorFeedback): MentorFeedback {
    this.data.mentorFeedbacks.push(fb);
    this.saveData();
    return fb;
  }

  public getMentoringSessions(studentId?: string, mentorId?: string): MentoringSession[] {
    return this.data.mentoringSessions.filter(s => {
      if (mentorId && s.mentorId !== mentorId) return false;
      if (studentId) {
        const matchesStudent = s.studentId === studentId || s.sessionType === 'GROUP' || s.studentId === 'all';
        if (!matchesStudent) return false;
      }
      return true;
    });
  }
  public addMentoringSession(sess: MentoringSession): MentoringSession {
    this.data.mentoringSessions.unshift(sess);
    this.saveData();
    return sess;
  }
  public updateMentoringSession(id: string, updates: Partial<MentoringSession>): MentoringSession | undefined {
    const s = this.data.mentoringSessions.find(x => x.id === id);
    if (s) {
      Object.assign(s, updates);
      this.saveData();
    }
    return s;
  }

  // Notifications & Achievements
  public getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }
  public addNotification(n: Notification): Notification {
    this.data.notifications.push(n);
    this.saveData();
    return n;
  }
  public markNotificationRead(id: string): void {
    const n = this.data.notifications.find(x => x.id === id);
    if (n) {
      n.read = true;
      this.saveData();
    }
  }

  public getAchievements(userId: string): Achievement[] {
    if (!this.data.achievements[userId]) {
      this.data.achievements[userId] = [
        { id: 'ach_1', title: 'First Test Completed', description: 'Complete your first aptitude test attempt', iconName: 'Award', isUnlocked: false, progressPercentage: 0 },
        { id: 'ach_2', title: '10 Coding Problems', description: 'Successfully solve 10 coding practice problems', iconName: 'Code', isUnlocked: false, progressPercentage: 0 },
        { id: 'ach_3', title: '50 Coding Problems', description: 'Master 50 coding problems across DSA topics', iconName: 'Zap', isUnlocked: false, progressPercentage: 0 },
        { id: 'ach_4', title: 'Aptitude Master', description: 'Score above 90% accuracy in 5 aptitude tests', iconName: 'Brain', isUnlocked: false, progressPercentage: 0 },
        { id: 'ach_5', title: 'Interview Ready', description: 'Complete an AI mock interview with score > 80%', iconName: 'CheckCircle2', isUnlocked: false, progressPercentage: 0 },
        { id: 'ach_6', title: 'Java Master', description: 'Complete all Java technical questions and challenges', iconName: 'Coffee', isUnlocked: false, progressPercentage: 0 },
        { id: 'ach_7', title: '7-Day Streak', description: 'Log in and solve at least 1 problem for 7 days in a row', iconName: 'Flame', isUnlocked: false, progressPercentage: 0 }
      ];
    }
    return this.data.achievements[userId];
  }

  // Mentor Approvals System (Sessions, Mock Interviews, Labs)
  public getMentorApprovals(filter?: { studentId?: string; mentorId?: string; status?: string }): MentorApprovalItem[] {
    return (this.data.mentorApprovals || []).filter(item => {
      if (filter?.studentId && item.studentId !== filter.studentId) return false;
      if (filter?.mentorId && item.mentorId && item.mentorId !== filter.mentorId) return false;
      if (filter?.status && item.status !== filter.status) return false;
      return true;
    });
  }

  public getMentorApprovalById(id: string): MentorApprovalItem | undefined {
    return (this.data.mentorApprovals || []).find(item => item.id === id);
  }

  public addMentorApproval(item: MentorApprovalItem): MentorApprovalItem {
    if (!this.data.mentorApprovals) this.data.mentorApprovals = [];
    this.data.mentorApprovals.unshift(item);
    this.saveData();
    return item;
  }

  public updateMentorApproval(id: string, updates: Partial<MentorApprovalItem>): MentorApprovalItem | undefined {
    if (!this.data.mentorApprovals) this.data.mentorApprovals = [];
    const idx = this.data.mentorApprovals.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.data.mentorApprovals[idx] = { ...this.data.mentorApprovals[idx], ...updates };
      this.saveData();
      return this.data.mentorApprovals[idx];
    }
    return undefined;
  }

  // Uploaded Notes (Mentor Drive)
  public getUploadedNotes(): UploadedNote[] {
    return this.data.uploadedNotes || [];
  }

  public getUploadedNotesByMentor(mentorId: string): UploadedNote[] {
    const notes = this.data.uploadedNotes || [];
    return notes.filter(n => n.mentorId.toLowerCase() === mentorId.toLowerCase());
  }

  public getUploadedNotesForStudent(studentId: string, mentorId?: string): UploadedNote[] {
    const notes = this.data.uploadedNotes || [];
    return notes.filter(n => {
      // If mentorId is provided, note must be from this mentor
      if (mentorId && n.mentorId.toLowerCase() !== mentorId.toLowerCase()) {
        return false;
      }
      // Note can only be accessed if student has an ACCEPTED mentorship with this mentor
      if (!this.isStudentAcceptedByMentor(studentId, n.mentorId)) {
        return false;
      }
      // Note is visible if targeted to 'all' or specifically to this student
      return !n.targetStudentId || n.targetStudentId === 'all' || n.targetStudentId.toLowerCase() === studentId.toLowerCase();
    });
  }

  public addUploadedNote(note: UploadedNote): UploadedNote {
    if (!this.data.uploadedNotes) this.data.uploadedNotes = [];
    this.data.uploadedNotes.unshift(note);
    this.saveData();
    return note;
  }

  public deleteUploadedNote(id: string, mentorId: string): boolean {
    if (!this.data.uploadedNotes) return false;
    const initialLen = this.data.uploadedNotes.length;
    this.data.uploadedNotes = this.data.uploadedNotes.filter(
      n => !(n.id === id && (n.mentorId.toLowerCase() === mentorId.toLowerCase() || mentorId === 'admin'))
    );
    if (this.data.uploadedNotes.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Mentorship Requests System
  public getMentorshipRequests(mentorId?: string, studentId?: string): MentorshipRequest[] {
    if (!this.data.mentorshipRequests) this.data.mentorshipRequests = [];
    return this.data.mentorshipRequests.filter(r => {
      if (mentorId && r.mentorId.toLowerCase() !== mentorId.toLowerCase()) return false;
      if (studentId && r.studentId.toLowerCase() !== studentId.toLowerCase()) return false;
      return true;
    });
  }

  public getMentorshipRequestById(id: string): MentorshipRequest | undefined {
    if (!this.data.mentorshipRequests) this.data.mentorshipRequests = [];
    return this.data.mentorshipRequests.find(r => r.id === id);
  }

  public addMentorshipRequest(req: MentorshipRequest): MentorshipRequest {
    if (!this.data.mentorshipRequests) this.data.mentorshipRequests = [];
    // Remove previous pending request for same student & mentor if any
    this.data.mentorshipRequests = this.data.mentorshipRequests.filter(
      r => !(r.studentId === req.studentId && r.mentorId === req.mentorId && r.status === 'PENDING')
    );
    this.data.mentorshipRequests.unshift(req);
    this.saveData();
    return req;
  }

  public updateMentorshipRequest(id: string, updates: Partial<MentorshipRequest>): MentorshipRequest | undefined {
    if (!this.data.mentorshipRequests) this.data.mentorshipRequests = [];
    const r = this.data.mentorshipRequests.find(x => x.id === id);
    if (r) {
      Object.assign(r, updates);
      this.saveData();
    }
    return r;
  }

  public isStudentAcceptedByMentor(studentId: string, mentorId: string): boolean {
    if (!this.data.mentorshipRequests) return false;
    return this.data.mentorshipRequests.some(
      r => r.studentId.toLowerCase() === studentId.toLowerCase() &&
           r.mentorId.toLowerCase() === mentorId.toLowerCase() &&
           r.status === 'ACCEPTED'
    );
  }

  // Mentor Exams
  public getMentorExams(mentorId?: string, studentId?: string): MentorExam[] {
    if (!this.data.mentorExams) this.data.mentorExams = [];
    return this.data.mentorExams.filter(e => {
      if (mentorId && e.mentorId.toLowerCase() !== mentorId.toLowerCase()) return false;
      if (studentId) {
        // Can take exam if targeted to 'all' or specifically to this student
        const isTarget = !e.targetStudentId || e.targetStudentId === 'all' || e.targetStudentId.toLowerCase() === studentId.toLowerCase();
        if (!isTarget) return false;
        // Student must be accepted by the mentor conducting this exam
        if (!this.isStudentAcceptedByMentor(studentId, e.mentorId)) return false;
      }
      return true;
    });
  }

  public getMentorExamById(id: string): MentorExam | undefined {
    if (!this.data.mentorExams) this.data.mentorExams = [];
    return this.data.mentorExams.find(e => e.id === id);
  }

  public addMentorExam(exam: MentorExam): MentorExam {
    if (!this.data.mentorExams) this.data.mentorExams = [];
    this.data.mentorExams.unshift(exam);
    this.saveData();
    return exam;
  }

  public updateMentorExam(id: string, updates: Partial<MentorExam>): MentorExam | undefined {
    if (!this.data.mentorExams) this.data.mentorExams = [];
    const e = this.data.mentorExams.find(x => x.id === id);
    if (e) {
      Object.assign(e, updates);
      this.saveData();
    }
    return e;
  }

  public deleteMentorExam(id: string, mentorId: string): boolean {
    if (!this.data.mentorExams) return false;
    const initialLen = this.data.mentorExams.length;
    this.data.mentorExams = this.data.mentorExams.filter(
      e => !(e.id === id && (e.mentorId.toLowerCase() === mentorId.toLowerCase() || mentorId === 'admin'))
    );
    if (this.data.mentorExams.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Student Exam Submissions
  public getExamSubmissions(examId?: string, studentId?: string, mentorId?: string): StudentExamSubmission[] {
    if (!this.data.examSubmissions) this.data.examSubmissions = [];
    return this.data.examSubmissions.filter(s => {
      if (examId && s.examId !== examId) return false;
      if (studentId && s.studentId.toLowerCase() !== studentId.toLowerCase()) return false;
      if (mentorId && s.mentorId.toLowerCase() !== mentorId.toLowerCase()) return false;
      return true;
    });
  }

  public getExamSubmissionById(id: string): StudentExamSubmission | undefined {
    if (!this.data.examSubmissions) this.data.examSubmissions = [];
    return this.data.examSubmissions.find(s => s.id === id);
  }

  public addExamSubmission(sub: StudentExamSubmission): StudentExamSubmission {
    if (!this.data.examSubmissions) this.data.examSubmissions = [];
    this.data.examSubmissions.unshift(sub);
    this.saveData();
    return sub;
  }

  public updateExamSubmission(id: string, updates: Partial<StudentExamSubmission>): StudentExamSubmission | undefined {
    if (!this.data.examSubmissions) this.data.examSubmissions = [];
    const s = this.data.examSubmissions.find(x => x.id === id);
    if (s) {
      Object.assign(s, updates);
      this.saveData();
    }
    return s;
  }
}

export const db = new LocalDB();
