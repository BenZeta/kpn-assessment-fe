import { create } from "zustand";
import { persist } from "zustand/middleware";

type GuidelineStatus = {
  batch_id: string;
  guideline_opened: boolean;
};

interface UseGuidelineReadStoreInterface {
  guideline_status: GuidelineStatus;
  setGuidelineStatus: ({ batch_id, guideline_opened }: GuidelineStatus) => void;
}

const useGuidelineReadStore = create<UseGuidelineReadStoreInterface>()(
  persist(
    set => ({
      guideline_status: { batch_id: "", guideline_opened: false },
      setGuidelineStatus: ({ batch_id, guideline_opened }) => {
        set({
          guideline_status: { batch_id: batch_id, guideline_opened: guideline_opened },
        });
      },
    }),
    { name: "guideline_stat" }
  )
);

export default useGuidelineReadStore;
