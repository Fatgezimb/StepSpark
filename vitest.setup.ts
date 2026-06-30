import "@testing-library/jest-dom/vitest";

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => undefined;
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => undefined;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}

const testStorage = new Map<string, string>();

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => testStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      testStorage.set(key, value);
    },
    removeItem: (key: string) => {
      testStorage.delete(key);
    },
    clear: () => {
      testStorage.clear();
    },
    key: (index: number) => Array.from(testStorage.keys())[index] ?? null,
    get length() {
      return testStorage.size;
    },
  },
});
