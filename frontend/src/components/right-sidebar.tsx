import { motion } from 'motion/react';
import { TrendingSection } from './trending-section';
import { RecentActivity } from './recent-activity';

interface RightSidebarProps {
  onPostClick?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
}

export function RightSidebar({ onPostClick, onUserClick }: RightSidebarProps) {
  const handlePostClick = (postId: string) => {
    console.log('Navigating to post:', postId);
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      // Add highlight class before scrolling
      postElement.classList.add('post-highlight');
      postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Remove highlight class after animation
      setTimeout(() => {
        postElement.classList.remove('post-highlight');
      }, 2000);
    }
  };

  const handleUserClick = (userId: string) => {
    // In a real app, this would navigate to user profile
    console.log('Navigating to user:', userId);
  };

  return (
    <div className="space-y-6">
      {/* Trending Section */}
      <TrendingSection onPostClick={handlePostClick} />

      {/* Recent Activity */}
      <RecentActivity 
        onPostClick={handlePostClick}
        onUserClick={handleUserClick}
      />
    </div>
  );
}