const mobileThreshold = 768;
const tabletThreshold = 1024;

export const useScreen = () => {
  const width = useState("screen-width", () => 1280);
  const height = useState("screen-height", () => 800);

  const isMobile = computed(() => width.value <= mobileThreshold);
  const isTablet = computed(
    () => width.value > mobileThreshold && width.value <= tabletThreshold,
  );
  const isDesktop = computed(() => width.value > tabletThreshold);

  const update = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  onMounted(() => {
    update();
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return { width, height, isMobile, isTablet, isDesktop };
};
