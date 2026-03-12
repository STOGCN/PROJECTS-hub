import { Component } from '@angular/core';

interface WorkTask {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  tasks: WorkTask[] = [
    {
      id: 1,
      title: 'Analyze Engine',
      description: 'Review Stockfish integration and optimize move calculation depth.',
      deadline: '14:30',
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'UI Polish',
      description: 'Implement glassmorphism effects on the dashboard components.',
      deadline: '16:00',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Auth Bugfix',
      description: 'Identify and resolve session timeout issues in production.',
      deadline: '18:00',
      status: 'pending'
    }
  ];

  activeTask = this.tasks[0];
  showTaskList = false;

  toggleTaskList() {
    this.showTaskList = !this.showTaskList;
  }

  selectTask(task: WorkTask) {
    this.activeTask = task;
    this.showTaskList = false;
  }
}
