export type OnboardingSlide = {
  id: string;
  image: any;
  title: string;
  subtitle: string;
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "1",
    image: require("../../../../assets/images/onboarding/image1.jpg"),
    title: "Visibility That Counts",
    subtitle: "Showcase your products to the right buyers, anytime, anywhere.",
  },
  {
    id: "2",
    image: require("../../../../assets/images/onboarding/image2.jpg"),
    title: "Grow Your Business",
    subtitle: "List your products, track sales, and deliver with confidence.",
  },
  {
    id: "3",
    image: require("../../../../assets/images/onboarding/image3.jpg"),
    title: "Your Shop, Your Rules",
    subtitle: "Manage products, orders, and customers all in one place.",
  },
];
