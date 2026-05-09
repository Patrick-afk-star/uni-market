export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  verified: boolean;
  joinedDate: string;
  bio?: string;
  location?: string;
  ratings?: {
    average: number;
    count: number;
  };
}

export const currentUser: User = {
  id: 'user-001',
  name: 'Alex Johnson',
  email: 'alex.johnson@university.edu',
  role: 'Student',
  avatar: '/avatar_student.jpg',
  verified: true, // Change to false to test unverified state
  joinedDate: '2024-01-15',
  bio: 'Computer Science student | Book lover | Tech enthusiast',
  location: 'Kigali, Rwanda',
  ratings: {
    average: 4.8,
    count: 24,
  },
};
