import { clamp } from './physics';

export interface InputTargets {
  steeringSurface: HTMLElement;
  touchLeftButton: HTMLElement;
  touchRightButton: HTMLElement;
}

export class InputController {
  private leftKeyPressed = false;
  private rightKeyPressed = false;
  private dragAxis = 0;
  private activeDragPointerId: number | null = null;
  private dragStartX = 0;
  private readonly activeTouchButtons = new Set<'left' | 'right'>();

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.leftKeyPressed = true;
      event.preventDefault();
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.rightKeyPressed = true;
      event.preventDefault();
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.leftKeyPressed = false;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.rightKeyPressed = false;
    }
  };

  private readonly onWindowBlur = (): void => {
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;
    this.dragAxis = 0;
    this.activeTouchButtons.clear();
  };

  private readonly onDragPointerDown = (event: PointerEvent): void => {
    this.activeDragPointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragAxis = 0;
    event.preventDefault();
    this.targets.steeringSurface.setPointerCapture?.(event.pointerId);
  };

  private readonly onDragPointerMove = (event: PointerEvent): void => {
    if (this.activeDragPointerId !== event.pointerId) {
      return;
    }

    this.dragAxis = clamp((event.clientX - this.dragStartX) / 62, -1, 1);
  };

  private readonly onDragPointerUp = (event: PointerEvent): void => {
    if (this.activeDragPointerId !== event.pointerId) {
      return;
    }

    this.activeDragPointerId = null;
    this.dragAxis = 0;
  };

  private readonly onLeftTouchDown = (event: PointerEvent): void => {
    this.activeTouchButtons.add('left');
    event.preventDefault();
    this.targets.touchLeftButton.setPointerCapture?.(event.pointerId);
  };

  private readonly onRightTouchDown = (event: PointerEvent): void => {
    this.activeTouchButtons.add('right');
    event.preventDefault();
    this.targets.touchRightButton.setPointerCapture?.(event.pointerId);
  };

  private readonly onLeftTouchUp = (): void => {
    this.activeTouchButtons.delete('left');
  };

  private readonly onRightTouchUp = (): void => {
    this.activeTouchButtons.delete('right');
  };

  constructor(private readonly targets: InputTargets) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);

    this.targets.steeringSurface.addEventListener('pointerdown', this.onDragPointerDown);
    this.targets.steeringSurface.addEventListener('pointermove', this.onDragPointerMove);
    this.targets.steeringSurface.addEventListener('pointerup', this.onDragPointerUp);
    this.targets.steeringSurface.addEventListener('pointercancel', this.onDragPointerUp);
    this.targets.steeringSurface.addEventListener('lostpointercapture', this.onDragPointerUp);

    this.targets.touchLeftButton.addEventListener('pointerdown', this.onLeftTouchDown);
    this.targets.touchLeftButton.addEventListener('pointerup', this.onLeftTouchUp);
    this.targets.touchLeftButton.addEventListener('pointercancel', this.onLeftTouchUp);
    this.targets.touchLeftButton.addEventListener('lostpointercapture', this.onLeftTouchUp);

    this.targets.touchRightButton.addEventListener('pointerdown', this.onRightTouchDown);
    this.targets.touchRightButton.addEventListener('pointerup', this.onRightTouchUp);
    this.targets.touchRightButton.addEventListener('pointercancel', this.onRightTouchUp);
    this.targets.touchRightButton.addEventListener('lostpointercapture', this.onRightTouchUp);
  }

  getSteeringAxis(): number {
    const touchAxis =
      (this.activeTouchButtons.has('right') ? 1 : 0) -
      (this.activeTouchButtons.has('left') ? 1 : 0);
    if (touchAxis !== 0) {
      return touchAxis;
    }

    if (Math.abs(this.dragAxis) > 0.02) {
      return this.dragAxis;
    }

    return (this.rightKeyPressed ? 1 : 0) - (this.leftKeyPressed ? 1 : 0);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);

    this.targets.steeringSurface.removeEventListener('pointerdown', this.onDragPointerDown);
    this.targets.steeringSurface.removeEventListener('pointermove', this.onDragPointerMove);
    this.targets.steeringSurface.removeEventListener('pointerup', this.onDragPointerUp);
    this.targets.steeringSurface.removeEventListener('pointercancel', this.onDragPointerUp);
    this.targets.steeringSurface.removeEventListener('lostpointercapture', this.onDragPointerUp);

    this.targets.touchLeftButton.removeEventListener('pointerdown', this.onLeftTouchDown);
    this.targets.touchLeftButton.removeEventListener('pointerup', this.onLeftTouchUp);
    this.targets.touchLeftButton.removeEventListener('pointercancel', this.onLeftTouchUp);
    this.targets.touchLeftButton.removeEventListener('lostpointercapture', this.onLeftTouchUp);

    this.targets.touchRightButton.removeEventListener('pointerdown', this.onRightTouchDown);
    this.targets.touchRightButton.removeEventListener('pointerup', this.onRightTouchUp);
    this.targets.touchRightButton.removeEventListener('pointercancel', this.onRightTouchUp);
    this.targets.touchRightButton.removeEventListener('lostpointercapture', this.onRightTouchUp);
  }
}
