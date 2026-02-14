import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InputController } from '../input';

const dispatchPointer = (
  target: EventTarget,
  type: string,
  pointerId: number,
  clientX: number,
): void => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  Object.defineProperty(event, 'clientX', { value: clientX });
  target.dispatchEvent(event);
};

describe('InputController', () => {
  let steeringSurface: HTMLDivElement;
  let touchLeftButton: HTMLButtonElement;
  let touchRightButton: HTMLButtonElement;
  let controller: InputController;

  beforeEach(() => {
    steeringSurface = document.createElement('div');
    touchLeftButton = document.createElement('button');
    touchRightButton = document.createElement('button');

    Object.assign(steeringSurface, { setPointerCapture: vi.fn() });
    Object.assign(touchLeftButton, { setPointerCapture: vi.fn() });
    Object.assign(touchRightButton, { setPointerCapture: vi.fn() });

    document.body.append(steeringSurface, touchLeftButton, touchRightButton);

    controller = new InputController({
      steeringSurface,
      touchLeftButton,
      touchRightButton,
    });
  });

  afterEach(() => {
    controller.dispose();
    document.body.replaceChildren();
  });

  it('tracks keyboard steering state', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    expect(controller.getSteeringAxis()).toBe(-1);

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft' }));
    expect(controller.getSteeringAxis()).toBe(0);
  });

  it('prioritizes touch button input over keyboard input', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    dispatchPointer(touchRightButton, 'pointerdown', 10, 0);
    expect(controller.getSteeringAxis()).toBe(1);

    dispatchPointer(touchRightButton, 'pointerup', 10, 0);
    expect(controller.getSteeringAxis()).toBe(-1);
  });

  it('converts drag distance into analog steering', () => {
    dispatchPointer(steeringSurface, 'pointerdown', 44, 100);
    dispatchPointer(steeringSurface, 'pointermove', 44, 170);
    expect(controller.getSteeringAxis()).toBeGreaterThan(0.75);

    dispatchPointer(steeringSurface, 'pointerup', 44, 170);
    expect(controller.getSteeringAxis()).toBe(0);
  });
});
