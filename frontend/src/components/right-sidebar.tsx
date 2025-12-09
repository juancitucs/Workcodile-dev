import { motion } from 'motion/react';
import { TrendingSection } from './trending-section';
import { RecentActivity } from './recent-activity';
import { FeaturedComments } from './featured-comments';
import { memo } from 'react';

export const RightSidebar = memo(function RightSidebar() {

  return (
    <div className="space-y-6">
      {/* Trending Section */}
      <TrendingSection />

      {/* Recent Activity */}
      <RecentActivity />

      {/* Featured Comments */}
      <FeaturedComments />
    </div>
  );
});