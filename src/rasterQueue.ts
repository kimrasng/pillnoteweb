// Cached frames commit immediately. Late decodes may only commit if they are
// still the requested frame, so reversing or changing clips cannot flash back.
export function createRasterQueue<Frame, Image>(
  load: (frame: Frame) => Image | Promise<Image>,
  commit: (frame: Frame, image: Image) => void,
) {
  let revision = 0;
  return {
    select(frame: Frame) {
      const current = ++revision;
      const result = load(frame);
      if (result instanceof Promise) {
        void result
          .then((image) => {
            if (current === revision) commit(frame, image);
          })
          .catch(() => {});
      } else commit(frame, result);
    },
    cancel() {
      revision++;
    },
  };
}
