import React from 'react';
import { Card, Button } from './index';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in React component tree:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--color-gray-50)' }}>
          <Card style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '40px 20px' }}>
            <AlertTriangle size={48} color="var(--color-error)" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', color: 'var(--color-gray-800)', marginBottom: '8px' }}>عذراً، حدث خطأ غير متوقع</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '24px', lineHeight: 1.6 }}>
              واجه النظام مشكلة أثناء تحميل هذه الصفحة. يرجى إعادة تحميل الصفحة أو العودة إلى الصفحة الرئيسية.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button onClick={() => window.location.reload()} variant="primary">إعادة تحميل الصفحة</Button>
              <Button onClick={() => window.location.href = '/'} variant="ghost">العودة للرئيسية</Button>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
