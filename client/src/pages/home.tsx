import HeroBanner from '@/components/home/hero-banner';
import CategoryBrowser from '@/components/home/category-browser';
import FeaturedProducts from '@/components/home/featured-products';
import TrendingItems from '@/components/home/trending-items';
import WaitlistForm from '@/components/home/waitlist-form';
import FeatureBlocks from '@/components/home/feature-blocks';

export const Home = () => {
  return (
    <>
      <HeroBanner />
      <CategoryBrowser />
      <FeaturedProducts />
      <TrendingItems />
      <WaitlistForm />
      <FeatureBlocks />
    </>
  );
};

export default Home;
