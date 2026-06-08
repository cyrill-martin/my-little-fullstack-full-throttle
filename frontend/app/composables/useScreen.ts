const mobileThreshold = 768;
const tabletThreshold = 1024;

const width = useState<number>("screen-width", () => 1280);
const height = useState<number>("screen-height", () => 800);

if (import.meta.client) {
  const update = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };
  update();
  window.addEventListener("resize", update);
}

export const useScreen = () => {
  const isMobile = computed(() => width.value <= mobileThreshold);
  const isTablet = computed(
    () => width.value > mobileThreshold && width.value <= tabletThreshold,
  );
  const isDesktop = computed(() => width.value > tabletThreshold);

  return { width, height, isMobile, isTablet, isDesktop };
};
