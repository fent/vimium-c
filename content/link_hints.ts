import HintItem = HintsNS.HintItem
import LinkEl = HintsNS.LinkEl
import FilteredHintItem = HintsNS.FilteredHintItem
interface Executor {
    (this: void, linkEl: LinkEl, rect: Rect | null, hintEl: Pick<HintItem, "r">): void | boolean;
}
interface ModeOpt extends ReadonlyArray<Executor | HintMode> {
    [0]: Executor;
    [1]: HintMode;
}
export interface KeyStatus {
    /** curHints */ c: readonly HintItem[];
    /** keySequence */ k: string;
    /** textSequence */ t: string;
    /** known */ n: BOOL;
    /** tab */ b: number;
}
interface HinterStatus {
  /** isActive */ a: BOOL
  /** box */ b: HTMLDivElement | HTMLDialogElement | null
  /** keyStatus */ k: Readonly<KeyStatus>
  /** mode */ m: HintMode
  /** is newly activated */ n: boolean | BOOL | null
}
interface BaseHinter extends HintsNS.BaseHinter {
  /** get stat */ $ (): Readonly<HinterStatus>
  /** clear */ c: typeof clear
  /** dialogMode */ d: boolean
  /** executeHint */ e: typeof executeHintInOfficer
  /** getPreciseChildRect */ g: typeof getPreciseChildRect
  /** has just started */ h: number
  /** delayToExecute */ j: typeof delayToExecute
  /** highlightHint */ l: typeof highlightHint
  /** collectFrameHints */ o: typeof collectFrameHints
  /** manager */ p: HintManager | null
  /** render */ r: typeof render
  /** rotate1 */ t: typeof rotate1
  /** checkLast_ */ x: typeof checkLast
  /** yankedList */ y: string[]
}
interface HintManager extends BaseHinter {
    hints_?: readonly HintItem[] | null
    /** get stat (also reset mode if needed) */ $ (resetMode?: 1): Readonly<HinterStatus>
    /** reinit */ i: typeof reinit
    /** onKeydown */ n: typeof onKeydown
    p: null;
    /** resetMode */ s: typeof resetMode
    /** onFrameUnload */ u: typeof onFrameUnload
    /** resetHints */ v (): void;
    /** setupCheck */ w (officer?: BaseHinter | null, el?: LinkEl | null, r?: Rect | null): void
}
interface HintOfficer extends BaseHinter {
    p: HintManager | null
}
interface ChildFrame {
    v: Rect | null;
    s: HintOfficer
}
interface FrameHintsInfo {
    h: readonly HintItem[];
    v: ViewBox;
    s: HintManager | HintOfficer
}

import {
  VTr, isAlive_, isEnabled_, setupEventListener, keydownEvents_, set_keydownEvents_, timeout_,
  clearTimeout_, VOther, fgCache, doc, readyState_, chromeVer_, vApi, deref_, getTime,
} from "../lib/utils"
import {
  frameElement_, querySelector_unsafe_, isHTML_, scrollingEl_, docEl_unsafe_, IsInDOM_, GetParent_unsafe_,
  getComputedStyle_, isStyleVisible_, htmlTag_, fullscreenEl_unsafe_,
} from "../lib/dom_utils"
import {
  getViewBox_, prepareCrop_, wndSize_, bZoom_, wdZoom_, dScale_, padClientRect_, getBoundingClientRect_,
  docZoom_, bScale_, dimSize_,
} from "../lib/rect"
import {
  pushHandler_, SuppressMost_, removeHandler_, getMappedKey, keybody_, isEscape_, getKeyStat_, keyNames_, suppressTail_,
  BSP,
  ENTER,
} from "../lib/keyboard_utils"
import {
  style_ui, addElementList, ensureBorder, adjustUI, flash_, getParentVApi, getWndVApi_ff, checkHidden, removeModal,
} from "./dom_ui"
import { scrollTick, beginScroll } from "./scroller"
import { hudTip, hudShow, hudHide, hud_tipTimer } from "./hud"
import { set_onWndBlur2, insert_Lock_ } from "./insert"
import {
  getVisibleElements, localLinkClear, frameNested_, checkNestedFrame, set_frameNested_, filterOutNonReachable,
} from "./local_links"
import {
  rotateHints, matchHintsByKey, zIndexes_, rotate1, initFilterEngine, initAlphabetEngine, renderMarkers,
  getMatchingHints, activeHint_, hintFilterReset, hintFilterClear, resetZIndexes, adjustMarkers, createHint,
  generateHintText,
} from "./hint_filters"
import {
  linkActions, executeHintInOfficer, removeFlash, set_hintModeAction, resetRemoveFlash, resetHintKeyCode,
} from "./link_actions"
import { lastHovered_, resetLastHovered } from "./async_dispatcher"
import { hookOnWnd } from "./port"

let box_: HTMLDivElement | HTMLDialogElement | null = null
let wantDialogMode_: boolean | null = null
let hints_: readonly HintItem[] | null = null
let frameList_: FrameHintsInfo[] = []
let mode_ = HintMode.empty
let mode1_ = HintMode.empty
let forHover_ = false
let count_ = 0
let lastMode_: HintMode = 0
let tooHigh_: null | boolean = false
let forceToScroll_ = 0
let isClickListened_ = true
let chars_ = ""
let useFilter_ = false
let keyStatus_: KeyStatus = null as never
  /** must be called from a manager, required by {@link #delayToExecute_ } */
let onTailEnter: ((this: unknown, event: HandlerNS.Event, key: string, keybody: kChar) => void) | null = null
let onWaitingKey: HandlerNS.RefHandler | null = null
let isActive: BOOL = 0
let noHUD_ = false
let options_: HintsNS.ContentOptions = null as never
let _timer = TimerID.None
let kSafeAllSelector = Build.BTypes & ~BrowserType.Firefox ? ":not(form)" as const : "*" as const
const kEditable = "input,textarea,[contenteditable]" as const
let manager_: HintManager | null = null
let api_: VApiTy = null as never
const unwrap_ff = (!(Build.BTypes & BrowserType.Firefox) ? 0 as never
      : <T extends object> (obj: T): T => (obj as XrayedObject<T>).wrappedJSObject || obj) as {
    <T extends SafeElement>(obj: T): T;
    (obj: Element): unknown;
    <T extends object>(obj: T): T;
}
  /** return whether the element's VHints is not accessible */
let addChildFrame_: ((child: BaseHinter
      , el: KnownIFrameElement, rect: Rect | null) => boolean) | null | undefined

export {
  isActive as isHintsActive,
  hints_ as allHints, keyStatus_ as hintKeyStatus, useFilter_, frameList_, chars_ as hintChars,
  mode_ as hintMode_, mode1_, options_ as hintOptions, count_ as hintCount_,
  forHover_, isClickListened_, forceToScroll_, tooHigh_,
  kSafeAllSelector, kEditable, unwrap_ff, addChildFrame_,
  api_ as hintApi, manager_ as hintManager,
}
export function set_kSafeAllSelector (_newKSafeAll: string): void { kSafeAllSelector = _newKSafeAll as any }
export function set_isClickListened_ (_newIsClickListened: boolean): void { isClickListened_ = _newIsClickListened }

export const activate = (options: HintsNS.ContentOptions, count: number, force?: 1 | TimerType.fake): void => {
    if (isActive && !force || !isEnabled_) { return; }
    if (checkHidden(kFgCmd.linkHints, count, options)) {
      return clear(1)
    }
    if (doc.body === null) {
      manager_ || clear()
      if (!_timer && readyState_ > "l") {
        _timer = timeout_(activate.bind(0 as never, options, count), 300)
        return pushHandler_(SuppressMost_, coreHints)
      }
    }
    const parApi = Build.BTypes & BrowserType.Firefox ? !fullscreenEl_unsafe_() && getParentVApi()
        : frameElement_() && !fullscreenEl_unsafe_() && getParentVApi();
    if (parApi) {
      parApi.l(style_ui)
      // recursively go up and use the topest frame in a same origin
      return parApi.h(options, count, 1)
    }
    const useFilter0 = options.useFilter, useFilter = useFilter0 != null ? !!useFilter0 : fgCache.f,
    frameList: FrameHintsInfo[] = frameList_ = [{h: [], v: null as never, s: coreHints}],
    toClean: HintOfficer[] = [],
    s0 = options.c, chars = s0 ? s0 + "" : useFilter ? fgCache.n : fgCache.c;
    if (chars.length < GlobalConsts.MinHintCharSetSize) {
      hudTip(kTip.fewChars, 1000)
      return clear()
    }
    if (Build.BTypes & BrowserType.ChromeOrFirefox) {
      if (Build.BTypes & BrowserType.Firefox && Build.MinFFVer < FirefoxBrowserVer.MinEnsuredShadowDOMV1
          || BrowserVer.MinEnsuredHTMLDialogElement < BrowserVer.MinShadowDOMV0
              && Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinShadowDOMV0) {
        removeModal()
      }
      coreHints.d = (!(Build.BTypes & ~BrowserType.Chrome) && Build.MinCVer >= BrowserVer.MinEnsuredHTMLDialogElement
            || typeof HTMLDialogElement === "function")
        && !!(wantDialogMode_ != null ? wantDialogMode_ : querySelector_unsafe_("dialog[open]"))
    }
    let allHints: readonly HintItem[], child: ChildFrame | undefined, insertPos = 0
      , frameInfo: FrameHintsInfo, total: number
    {
      const childFrames: ChildFrame[] = [],
      addChild: typeof addChildFrame_ = (child, el, rect): boolean => {
        const childApi = detectUsableChild(el),
        officer: HintOfficer | null | undefined = childApi && (childApi.b as HintOfficer)
        if (officer) {
          childApi!.l(style_ui)
          childFrames.splice(insertPos, 0, {
            v: rect && child.g(el, rect),
            s: officer
          });
        }
        return !officer;
      };
      coreHints.o(count, options, chars, useFilter, null, null, frameList[0], addChild)
      allHints = frameList[0].h;
      while (child = childFrames.pop()) {
        if (child.v) {
          insertPos = childFrames.length;
          frameList.push(frameInfo = {h: [], v: null as never, s: child.s});
          child.s.o(count, options, chars, useFilter, child.v, coreHints, frameInfo, addChild);
          // ensure allHints always belong to the manager frame
          allHints = frameInfo.h.length ? allHints.concat(frameInfo.h) : allHints;
        } else if (child.s.$().a) {
          toClean.push(child.s);
        }
      }
      for (const i of toClean) { i.p = null; i.c() }
      total = allHints.length;
      if (!total || total > GlobalConsts.MaxCountToHint) {
        hudTip(total ? kTip.tooManyLinks : kTip.noLinks, 1000)
        return clear()
      }
      hints_ = keyStatus_.c = allHints
      if (!Build.NDEBUG) { coreHints.hints_ = allHints }
    }
    noHUD_ = !(useFilter || frameList[0].v[3] > 40 && frameList[0].v[2] > 320)
        || (options.hideHUD || options.hideHud) === true;
    useFilter ? initFilterEngine(allHints as readonly FilteredHintItem[]) : initAlphabetEngine(allHints)
    renderMarkers(allHints)
    setMode(mode_);
    coreHints.h = 1
    for (const frame of frameList) {
      frame.s.r(frame.h, frame.v, vApi);
    }
}

const collectFrameHints = (count: number, options: HintsNS.ContentOptions
      , chars: string, useFilter: boolean, outerView: Rect | null
      , manager: HintManager | null, frameInfo: FrameHintsInfo
      , newAddChildFrame: NonNullable<typeof addChildFrame_>
      ): void => {
    (coreHints as BaseHinter).p = manager_ =
        Build.BTypes & BrowserType.Firefox ? manager && unwrap_ff(manager) : manager
    resetHints();
    scrollTick(2);
    let modeAction: ModeOpt | undefined;
    if (options_ !== options) {
      /** ensured by {@link ../background/commands.ts#Commands.makeCommand_} */
      let mode = options.m as number;
      for (let modes of linkActions) {
        if (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinEnsuredES6$Array$$Includes
            ? modes.indexOf(mode & ~HintMode.queue) > 0 : modes.includes!(mode & ~HintMode.queue)) {
          modeAction = modes;
          break;
        }
      }
      if (!modeAction) {
        modeAction = linkActions[8];
        mode = HintMode.DEFAULT;
      }
      mode = count > 1 ? mode ? mode | HintMode.queue : HintMode.OPEN_WITH_QUEUE : mode;
      set_hintModeAction(modeAction);
      options_ = options;
      count_ = count;
      setMode(mode, 1);
    }
    chars_ = chars;
    useFilter_ = useFilter
    if (!isHTML_()) {
      return;
    }
    const view: ViewBox = getViewBox_(Build.BTypes & BrowserType.Chrome && (manager || coreHints
        ).d ? 2 : 1);
    prepareCrop_(1, outerView);
    if (tooHigh_ !== null) {
      const scrolling = scrollingEl_(1)
      tooHigh_ = !!scrolling
          && dimSize_(scrolling, kDim.scrollH) / wndSize_() > GlobalConsts.LinkHintTooHighThreshold
    }
    removeModal()
    forceToScroll_ = options.scroll === "force" ? 2 : 0;
    addChildFrame_ = newAddChildFrame
    const elements = getVisibleElements(view);
    const hintItems = elements.map(createHint);
    addChildFrame_ = null
    bZoom_ !== 1 && adjustMarkers(hintItems, elements);
    for (let i = useFilter_ ? hintItems.length : 0; 0 <= --i; ) {
      hintItems[i].h = generateHintText(elements[i], i, hintItems)
    }
    frameInfo.h = hintItems;
    frameInfo.v = view;
}

const render = (hints: readonly HintItem[], arr: ViewBox, raw_apis: VApiTy): void => {
    const managerOrA = manager_ || coreHints;
    let body = doc.body
    manager_ && body && htmlTag_(body) && body.isContentEditable && hookOnWnd(HookAction.Install)
    removeBox()
    api_ = Build.BTypes & BrowserType.Firefox && manager_ ? unwrap_ff(raw_apis) : raw_apis;
    ensureBorder(wdZoom_ / dScale_);
    if (hints.length) {
      if (Build.BTypes & BrowserType.Chrome) {
        box_ = addElementList(hints, arr, managerOrA.d);
      } else {
        box_ = addElementList(hints, arr);
      }
    } else if (coreHints === managerOrA) {
      adjustUI();
    }
    /*#__INLINE__*/ set_keydownEvents_((Build.BTypes & BrowserType.Firefox ? api_ : raw_apis).a())
    /*#__INLINE__*/ set_onWndBlur2(managerOrA.s);
    removeHandler_(coreHints)
    pushHandler_(coreHints.n, coreHints)
    manager_ && setupEventListener(0, "unload", clear);
    isActive = 1;
}

/** must be called from the manager context, or be used to sync mode from the manager */
export const setMode = (mode: HintMode, silent?: BOOL): void => {
    let msg: string
    mode_ - mode ? lastMode_ = mode_ = mode : 0
    mode1_ = mode & ~HintMode.queue;
    forHover_ = mode1_ > HintMode.min_hovering - 1 && mode1_ < HintMode.max_hovering + 1;
    if (silent || noHUD_ || hud_tipTimer) { return }
    msg = VTr(mode_) + (useFilter_ ? ` [${keyStatus_.t}]` : "")
    if (Build.BTypes & BrowserType.Chrome) {
      msg += (manager_ || coreHints).d ? VTr(kTip.modalHints) : "";
    }
    hudShow(kTip.raw, [msg], true)
}

const getPreciseChildRect = (frameEl: KnownIFrameElement, view: Rect): Rect | null => {
    const max = Math.max, min = Math.min, V = "visible",
    brect = padClientRect_(getBoundingClientRect_(frameEl)),
    docEl = docEl_unsafe_(), body = doc.body, inBody = !!body && IsInDOM_(frameEl, body, 1),
    zoom = (Build.BTypes & BrowserType.Chrome ? docZoom_ * (inBody ? bZoom_ : 1) : 1
        ) / dScale_ / (inBody ? bScale_ : 1);
    let x0 = min(view.l, brect.l), y0 = min(view.t, brect.t), l = x0, t = y0, r = view.r, b = view.b
    for (let el: Element | null = frameEl; el = GetParent_unsafe_(el, PNType.RevealSlotAndGotoParent); ) {
      const st = getComputedStyle_(el);
      if (st.overflow !== V) {
        let outer = padClientRect_(getBoundingClientRect_(el)), hx = st.overflowX !== V, hy = st.overflowY !== V,
        scale = el !== docEl && inBody ? dScale_ * bScale_ : dScale_;
        /** Note: since `el` is not safe, `dimSize_(el, *)` may returns `NaN` */
        hx && (l = max(l, outer.l), r = l + min(r - l, outer.r - outer.l
              , hy && dimSize_(el as SafeElement, kDim.elClientW) * scale || r))
        hy && (t = max(t, outer.t), b = t + min(b - t, outer.b - outer.t
              , hx && dimSize_(el as SafeElement, kDim.elClientH) * scale || b))
      }
    }
    l = max(l, view.l), t = max(t, view.t);
    const cropped = l + 7 < r && t + 7 < b ? {
        l: (l - x0) * zoom, t: (t - y0) * zoom, r: (r - x0) * zoom, b: (b - y0) * zoom} : null;
    let hints: Hint[] | null;
    return !cropped || fgCache.e && !(
        filterOutNonReachable(hints = [[frameEl as SafeHTMLElement, {l, t, r, b}, HintsNS.ClickType.frame]]),
        hints.length) ? null : cropped
}

export const tryNestedFrame = (
      cmd: Exclude<FgCmdAcrossFrames, kFgCmd.linkHints>, count: number, options: SafeObject): boolean => {
    let childApi: VApiTy | null
    if (frameNested_ !== null) {
      prepareCrop_();
      checkNestedFrame();
    }
    if (!frameNested_) { return false; }
    childApi = detectUsableChild(frameNested_);
    if (childApi) {
      childApi.f(cmd, count, options);
      if (readyState_ > "i") { set_frameNested_(false) }
    } else {
      // It's cross-site, or Vimium C on the child is wholly disabled
      // * Cross-site: it's in an abnormal situation, so we needn't focus the child;
      set_frameNested_(null)
    }
    return !!childApi;
}

const onKeydown = (event: HandlerNS.Event): HandlerResult => {
    let matchedHint: ReturnType<typeof matchHintsByKey>, i: number = event.i, key: string, keybody: kChar;
    let ret = HandlerResult.Prevent, num1: number | undefined, mode = mode_, mode1 = mode1_
    if (manager_) {
      /*#__INLINE__*/ set_keydownEvents_(api_.a());
      ret = manager_.n(event)
    } else if (onWaitingKey) {
      onWaitingKey(event);
    } else if (event.e.repeat || !isActive) {
      // NOTE: should always prevent repeated keys.
    } else if (i === kKeyCode.ime) {
      hudTip(kTip.exitForIME)
      clear()
      ret = HandlerResult.Nothing
    } else if (key = getMappedKey(event, kModeId.Link), keybody = keybody_(key),
        isEscape_(key) || onTailEnter && keybody === BSP) {
      clear();
    } else if (i === kKeyCode.esc && isEscape_(keybody)) {
      ret = HandlerResult.Suppress
    } else if (onTailEnter && keybody !== kChar.f12) {
      onTailEnter(event, key, keybody);
    } else if (keybody > kChar.maxNotF_num && keybody < kChar.minNotF_num && key !== kChar.f1) { // exclude plain <f1>
      if (keybody > kChar.f1 && keybody !== kChar.f2) { ret = HandlerResult.Nothing }
      else if (keybody < kChar.f2) {
        if (key < "b" && useFilter_) {
          locateHint(activeHint_!).l(activeHint_!);
        } else if (key > "s") {
          // `/^s-(f1|f0[a-z0-9]+)$/`
          /*#__NOINLINE__*/ addClassName(keybody)
        }
      } // the below mens f2, f0***
      else if (num1 = 1, key.includes("-s")) {
        fgCache.e = !fgCache.e;
      } else if (key < "b") { // a-
        !(Build.BTypes & BrowserType.Chrome) ? num1 = 0 :
        wantDialogMode_ = !wantDialogMode_;
      } else if ("cm".includes(key[0])) {
        options_.useFilter = fgCache.f = !useFilter_;
      } else if (key !== keybody) { // <s-f2>
        isClickListened_ = !isClickListened_;
      } else if (Build.BTypes & BrowserType.Firefox
              && (!(Build.BTypes & ~BrowserType.Firefox) || VOther === BrowserType.Firefox)
              && isClickListened_
            || !vApi.e) {
        num1 = 0
      } else {
        isClickListened_ = true;
        if (Build.BTypes & ~BrowserType.Firefox) {
          vApi.e(kContentCmd.ManuallyFindAllOnClick);
        }
      }
      resetMode(num1 as BOOL | undefined)
      num1 && timeout_(reinit, 0)
    } else if ((i < kKeyCode.maxAcsKeys + 1 && i > kKeyCode.minAcsKeys - 1
            || !fgCache.o && (i > kKeyCode.maxNotMetaKey && i < kKeyCode.minNotMetaKeyOrMenu))
        && !key) {
      num1 = mode1 > HintMode.min_copying - 1 && mode1 < HintMode.max_copying + 1
        ? i === kKeyCode.ctrlKey || i > kKeyCode.maxNotMetaKey ? (mode1 | HintMode.queue) ^ HintMode.list
          : i === kKeyCode.altKey ? (mode & ~HintMode.list) ^ HintMode.queue
          : mode
        : i === kKeyCode.altKey
        ? mode < HintMode.min_disable_queue
          ? ((mode1 < HintMode.min_job ? HintMode.newTab : HintMode.empty) | mode) ^ HintMode.queue : mode
        : mode1 < HintMode.min_job
        ? (i === kKeyCode.shiftKey) === !options_.swapCtrlAndShift
          ? (mode | HintMode.focused) ^ HintMode.mask_focus_new
          : (mode | HintMode.newTab) ^ HintMode.focused
        : mode;
      if (num1 !== mode) {
        setMode(num1);
        i = getKeyStat_(event.e);
        (i & (i - 1)) || (lastMode_ = mode);
      }
    } else if (i = keyNames_.indexOf(keybody), i > 0) {
      i > 2 && insert_Lock_ || beginScroll(event, key, keybody);
      resetMode();
      ret = i > 2 && insert_Lock_ ? HandlerResult.Suppress : HandlerResult.Prevent
    } else if (keybody === kChar.tab && !useFilter_ && !keyStatus_.k) {
      tooHigh_ = null;
      resetMode();
      timeout_(reinit, 0)
    } else if (keybody === kChar.space && (!useFilter_ || key !== keybody)) {
      keyStatus_.t = keyStatus_.t.replace("  ", " ");
      zIndexes_ !== 0 && /*#__NOINLINE__*/ rotateHints(key === "s-" + keybody);
      resetMode();
    } else if (matchedHint = /*#__NOINLINE__*/ matchHintsByKey(keyStatus_, event, key, keybody), matchedHint === 0) {
      // then .keyStatus_.hintSequence_ is the last key char
      clear(0, keyStatus_.n ? 0 : fgCache.k[0]);
    } else if (matchedHint !== 2) {
      lastMode_ = mode_;
      callExecuteHint(matchedHint, event)
    }
    return ret;
}

const addClassName = (name: string): void => {
  for (const frame of frameList_) {
    frame.s.$().b!.classList.toggle("HM-" + name)
  }
}

const callExecuteHint = (hint: HintItem, event?: HandlerNS.Event): void => {
  const selectedHinter = locateHint(hint), clickEl = hint.d,
  result = selectedHinter.e(hint, event)
  result !== 0 && timeout_((): void => {
    removeFlash && removeFlash()
    resetRemoveFlash()
    if (!(mode_ & HintMode.queue)) {
      coreHints.w(selectedHinter, clickEl)
      clear(0, 0)
    } else {
      clearTimeout_(_timer)
      timeout_((): void => {
        reinit(0, selectedHinter, clickEl, result)
        if (isActive && 1 === (--count_)) {
          setMode(mode1_)
        }
      }, frameList_.length > 1 ? 50 : 18)
    }
  }, isActive = 0)
}

const locateHint = (matchedHint: HintItem): BaseHinter => {
    /** safer; necessary since {@link #highlightChild} calls {@link #detectUsableChild} */
    const arr = frameList_;
    for (const list of arr.length > 1 && matchedHint ? arr : []) {
      if (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinEnsuredES6$Array$$Includes
          ? list.h.indexOf(matchedHint) >= 0 : list.h.includes!(matchedHint)) {
        return list.s;
      }
    }
    return coreHints;
}

const highlightHint = (hint: HintItem): void => {
  flash_(hint.m, null, 660, " Sel")
  box_!.classList.toggle("HMM")
}

export const resetMode = (silent?: BOOL): void => {
    if (lastMode_ !== mode_ && mode_ < HintMode.min_disable_queue) {
      let d = keydownEvents_;
      if (d[kKeyCode.ctrlKey] || d[kKeyCode.metaKey] || d[kKeyCode.shiftKey] || d[kKeyCode.altKey]
          || d[kKeyCode.osRightMac] || d[kKeyCode.osRightNonMac]) {
        setMode(lastMode_, silent);
      }
    }
}

const delayToExecute = (officer: BaseHinter, hint: HintItem, flashEl: SafeHTMLElement | null): void => {
    const waitEnter = Build.BTypes & BrowserType.Chrome && fgCache.w,
    callback = (event?: HandlerNS.Event, key?: string, keybody?: string): void => {
      let closed: void | 1 | 2
      try {
        closed = officer.x(1);
      } catch {}
      if (closed !== 2) {
        hudTip(kTip.linkRemoved)
        isActive && clear()
      } else if (event) {
        tick = waitEnter && keybody === kChar.space ? tick + 1 : 0;
        tick === 3 || keybody === ENTER ? callExecuteHint(hint, event)
        : key === kChar.f1 && flashEl ? flashEl.classList.toggle("Sel") : 0;
      } else {
        callExecuteHint(hint);
      }
    };
    let tick = 0;
    onTailEnter = callback;
    removeBox()
    Build.BTypes & BrowserType.Firefox && (officer = unwrap_ff(officer));
    if (Build.BTypes & BrowserType.Chrome && !waitEnter) {
      onWaitingKey = suppressTail_(GlobalConsts.TimeOfSuppressingTailKeydownEvents, callback, 1)
    } else {
      hudShow(kTip.waitEnter);
    }
}

/** reinit: should only be called on manager */
const reinit = (auto?: BOOL | TimerType.fake, officer?: BaseHinter | null
    , lastEl?: LinkEl | null, rect?: Rect | null): void => {
  if (!isEnabled_) { isAlive_ && clear() }
  else {
    isActive = 0;
    resetHints();
    activate(options_, 0);
    coreHints.w(officer, lastEl, rect);
    onWaitingKey = auto ? suppressTail_(GlobalConsts.TimeOfSuppressingUnexpectedKeydownEvents
        , /*#__NOINLINE__*/ resetOnWaitKey, 1) : onWaitingKey
  }
}

const resetOnWaitKey = (): void => { onWaitingKey = null }

/** setupCheck: should only be called on manager */
const setupCheck: HintManager["w"] = (officer?: BaseHinter | null, el?: LinkEl | null, r?: Rect | null): void => {
    _timer && clearTimeout_(_timer);
    _timer = officer && el && mode1_ < HintMode.min_job ? timeout_((i): void => {
      _timer = TimerID.None;
      let doesReinit: BOOL | boolean | void | undefined
      try {
        doesReinit = !(Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinNo$TimerType$$Fake && i)
            && (Build.BTypes & BrowserType.Firefox ? unwrap_ff(officer!) : officer).x(el, r)
      } catch {}
      doesReinit && reinit(1)
      coreHints.h = isActive && getTime()
    }, frameList_.length > 1 ? 380 : 255) : TimerID.None;
}

// checkLast: if not el, then reinit if only no key stroke and hints.length < 64
const checkLast = function (this: void, el?: LinkEl | TimerType.fake | 1, r?: Rect | null): BOOL | 2 {
  let r2: Rect | null, hidden: boolean
  if (!isAlive_) { return 0 }
  else if (window.closed) { return 1 }
  else if (el === 1) { return 2 }
  else {
    r2 = el && (!(Build.BTypes & BrowserType.Chrome) || Build.MinCVer >= BrowserVer.MinNo$TimerType$$Fake
                      /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
                      // @ts-expect-error
                      || el !== TimerType.fake
                      ) ? padClientRect_(getBoundingClientRect_(el as LinkEl)) : null
                      /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
    hidden = !r2 || r2.r - r2.l < 2 && r2.b - r2.t < 2
        || !isStyleVisible_(el as LinkEl); // use 2px: may be safer
    if (hidden && deref_(lastHovered_) === el) {
      /*#__INLINE__*/ resetLastHovered()
    }
    if ((!r2 || r) && (manager_ || coreHints).$().n
        && (hidden || Math.abs(r2!.l - r!.l) > 100 || Math.abs(r2!.t - r!.t) > 60)) {
      return manager_ ? 1 : (reinit(1), 0)
    } else {
      return 0
    }
  }
} as {
    (el?: LinkEl | TimerType.fake, r?: Rect | null): void | BOOL;
    (el: 1, r?: Rect | null): void | 1 | 2;
}

const resetHints = (): void => {
    // here should not consider about .manager_
    onWaitingKey = onTailEnter = hints_ = null as never;
    if (!Build.NDEBUG) { coreHints.hints_ = null }
    /*#__INLINE__*/ hintFilterReset();
    keyStatus_ && (keyStatus_.c = null as never);
    keyStatus_ = {
      c: null as never,
      k: "", t: "",
      n: 0, b: 0
    };
    for (const frame of frameList_) {
      frame.h = [];
    }
}

export const clear = (onlySelfOrEvent?: 0 | 1 | Event, suppressTimeout?: number): void => {
    if (!isAlive_) { return; }
    if (onlySelfOrEvent === 1 || onlySelfOrEvent
        && (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.Min$Event$$IsTrusted
            ? onlySelfOrEvent.isTrusted !== !1 : onlySelfOrEvent.isTrusted)
        && onlySelfOrEvent.target === doc) {
      coreHints.p && manager_!.u(coreHints);
      manager_ = null
      if (onlySelfOrEvent !== 1) {
        return;
      }
    }
    const manager = coreHints.p as HintManager | null;
    isActive = _timer = 0
    manager_ = coreHints.p = null;
    manager && manager.c(onlySelfOrEvent, suppressTimeout);
    frameList_.forEach((frameInfo: FrameHintsInfo): void => { try {
      let frame = frameInfo.s, hasManager = frame.p
      frame.p = null
      hasManager && frame.c(0, suppressTimeout)
    } catch { /* empty */ } }, suppressTimeout);
    coreHints.y = frameList_ = [];
    setupEventListener(0, "unload", clear, 1);
    resetHints();
    removeHandler_(coreHints)
    suppressTimeout != null && suppressTail_(suppressTimeout);
    /*#__INLINE__*/ set_onWndBlur2(null);
    removeFlash && removeFlash();
    api_ = options_ = null as never
    /*#__INLINE__*/ set_hintModeAction(null)
    /*#__INLINE__*/ resetRemoveFlash()
    /*#__INLINE__*/ localLinkClear()
    /*#__INLINE__*/ hintFilterClear()
    lastMode_ = mode_ = mode1_ = count_ = forceToScroll_ = coreHints.h = 0
    /*#__INLINE__*/ resetHintKeyCode()
    useFilter_ = noHUD_ = tooHigh_ = false
    if (Build.BTypes & BrowserType.ChromeOrFirefox) { coreHints.d = false; }
    chars_ = "";
    removeBox()
    hud_tipTimer || hudHide()
}

const removeBox = (): void => {
    if (box_) {
      box_.remove();
      box_ = null;
    }
    removeModal()
}

const onFrameUnload = (officer: HintOfficer): void => {
    const frames = frameList_, len = frames.length;
    const wrappedOfficer_ff = Build.BTypes & BrowserType.Firefox ? unwrap_ff(officer) : 0 as never as null
    let i = 0, offset = 0;
    while (i < len && frames[i].s !== (Build.BTypes & BrowserType.Firefox ? wrappedOfficer_ff! : officer)) {
      offset += frames[i++].h.length;
    }
    if (i >= len || !isActive || _timer) { return; }
    const deleteCount = frames[i].h.length
    deleteCount && (hints_ as HintItem[]).splice(offset, deleteCount) // remove `readonly` by intent
    frames.splice(i, 1);
    if (!deleteCount) { return; }
    onWaitingKey = onTailEnter ? onWaitingKey
        : suppressTail_(GlobalConsts.TimeOfSuppressingUnexpectedKeydownEvents, /*#__NOINLINE__*/ resetOnWaitKey, 1)
    resetZIndexes()
    keyStatus_.c = hints_!
    keyStatus_.n = keyStatus_.b = 0
    if (!hints_!.length) {
      hudTip(kTip.frameUnloaded)
      clear()
    } else if (useFilter_) {
      getMatchingHints(keyStatus_, "", "", 1)
    } else {
      hints_!.forEach(i => { i.m.innerText = "" })
      initAlphabetEngine(hints_!)
      renderMarkers(hints_!)
    }
}

export const detectUsableChild = (el: KnownIFrameElement): VApiTy | null => {
  let err: boolean | null = true, childEvents: VApiTy | null | void | undefined
  try {
    err = !el.contentDocument
      || !(childEvents = Build.BTypes & BrowserType.Firefox ? getWndVApi_ff!(el.contentWindow) : el.contentWindow.VApi)
      || childEvents.a(keydownEvents_);
  } catch (e) {
    if (!Build.NDEBUG) {
      let notDocError = true;
      if (Build.BTypes & BrowserType.Chrome && chromeVer_ < BrowserVer.Min$ContentDocument$NotThrow) {
        try {
          notDocError = el.contentDocument !== void 0
        } catch { notDocError = false; }
      }
      if (notDocError) {
        console.log("Assert error: Child frame check breaks:", e);
      }
    }
  }
  return err ? null : childEvents || null;
}

const coreHints: HintManager = {
  $: (resetMode?: 1): HinterStatus => {
    return { a: isActive, b: box_, k: keyStatus_, m: resetMode ? mode_ = HintMode.DEFAULT : mode_,
      n: isActive && hints_ && hints_.length < (frameList_.length > 1 ? 200 : 100) && !keyStatus_.k }
  },
  d: Build.BTypes & BrowserType.Chrome ? false : 0 as never, h: 0, y: [],
  x: checkLast, c: clear, o: collectFrameHints, j: delayToExecute, e: executeHintInOfficer, g: getPreciseChildRect,
  l: highlightHint, r: render, t: rotate1,
  p: null,
  n: onKeydown, s: resetMode, i: reinit, v: resetHints, u: onFrameUnload, w: setupCheck
}
if (!Build.NDEBUG) { coreHints.hints_ = null }

export { HintManager, coreHints }

if (!(Build.NDEBUG || HintMode.min_not_hint <= <number> kTip.START_FOR_OTHERS)) {
  console.log("Assert error: HintMode.min_not_hint <= kTip.START_FOR_OTHERS");
}
