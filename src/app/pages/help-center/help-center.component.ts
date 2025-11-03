import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent {
  searchQuery = '';
  openFAQ: number | null = null;

  faqs: FAQ[] = [
    {
      question: 'How do I add a new expense?',
      answer: 'Go to the Expenses page and click on the "+ Add Expense" button. Fill in the required details and click Save.'
    },
    {
      question: 'Can I edit or delete an expense?',
      answer: 'Yes, you can edit or delete any expense from the Expenses list by clicking the Edit or Delete icon next to it.'
    },
    {
      question: 'What are categories used for?',
      answer: 'Categories help you organize your expenses and view analytics by grouping similar transactions together.'
    },
    {
      question: 'How can I export my data?',
      answer: 'In the Expenses page, click on "Export to Excel" to download your expense data in spreadsheet format.'
    },
    {
      question: 'How do I reset filters in analytics?',
      answer: 'In the Analytics page, click the "Reset" button to restore default filter selections.'
    }
  ];

  filteredFAQs: FAQ[] = [...this.faqs];

  supportForm = {
    name: '',
    email: '',
    message: ''
  };

  toggleFAQ(index: number) {
    this.openFAQ = this.openFAQ === index ? null : index;
  }

  filterFAQs() {
    const query = this.searchQuery.toLowerCase();
    this.filteredFAQs = this.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }

  sendSupportMessage() {
    if (!this.supportForm.name || !this.supportForm.email || !this.supportForm.message) {
      alert('⚠️ Please fill in all fields before submitting.');
      return;
    }
    alert('✅ Your message has been sent! Our team will contact you shortly.');
    console.log('Support message:', this.supportForm);
    this.supportForm = { name: '', email: '', message: '' };
  }
}
