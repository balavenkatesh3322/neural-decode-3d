import { useAppStore } from '../../store/useAppStore';
import { useIsMobile } from '../../hooks/useIsMobile';

/**
 * What chrome to show. `home`: the landing hero is up. `focused`: the guided tour is playing with
 * focus mode on. `minimal` hides side panels, minimap and tool ribbon so the 3D model takes the stage.
 */
export function useFocus() {
  const home = useAppStore((s) => s.home);
  const focusPref = useAppStore((s) => s.prefs.focusOnTour);
  const playing = useAppStore((s) => s.tour.playing);
  const mobile = useIsMobile();
  const focused = !home && focusPref && playing && !mobile;
  return { home, focused, minimal: home || focused };
}
