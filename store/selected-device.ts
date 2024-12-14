import { create } from "zustand";

interface KoboDevice {
  name: string;
  path: string;
}

interface SelectedDeviceStore {
  device: KoboDevice | null;
  setDevice: (device: KoboDevice | null) => void;
}

export const useSelectedDevice = create<SelectedDeviceStore>((set) => ({
  device: null,
  setDevice: (device) => set({ device }),
}));
