// Styles des Editor-Panels. Als JS-String, weil sie in den Shadow DOM des Panels geladen werden
// (so beeinflussen sich Seite und Panel gegenseitig nicht).
window.SDEditorCss = `
:host { all: initial; }
* { box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
button, input, select { font: inherit; color: inherit; }
[hidden] { display: none !important; }

.box { position: fixed; pointer-events: none; border-radius: 3px; z-index: 1; }
.hover { outline: 2px dashed #6366f1; outline-offset: -1px; background: rgba(99, 102, 241, .07); }
.sel { outline: 2px solid #4f46e5; outline-offset: -1px; box-shadow: 0 0 0 4px rgba(79, 70, 229, .18); }
.drop-box { outline: 2px dashed #f59e0b; outline-offset: -1px; background: rgba(245, 158, 11, .10); }
.drop-line { position: fixed; pointer-events: none; background: #f59e0b; border-radius: 3px; box-shadow: 0 0 0 3px rgba(245, 158, 11, .25); z-index: 2; }
.tag {
  position: fixed; pointer-events: none; z-index: 3;
  background: #4f46e5; color: #fff; font-size: 11px; line-height: 1; font-weight: 600;
  padding: 4px 7px; border-radius: 5px; white-space: nowrap;
}
.tag.hover-tag { background: #6366f1; }
.tag small { font-weight: 400; opacity: .8; margin-left: 4px; }
.handle {
  position: fixed; z-index: 4; pointer-events: auto; cursor: grab;
  border: 0; border-radius: 999px; padding: 5px 10px 5px 8px;
  background: #f59e0b; color: #2b1700; font-size: 11px; font-weight: 700;
  box-shadow: 0 3px 10px rgba(0, 0, 0, .25);
}
.handle:hover { background: #fbbf24; }
.ghost {
  position: fixed; z-index: 5; pointer-events: none;
  background: #1e1b4b; color: #fff; font-size: 12px; padding: 6px 10px; border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .3); white-space: nowrap;
}

.panel {
  position: fixed; z-index: 10; width: 304px; max-height: calc(100vh - 24px);
  display: flex; flex-direction: column; overflow: hidden; pointer-events: auto;
  background: #fff; color: #1e1b2e; font-size: 13px; line-height: 1.4;
  border-radius: 14px; box-shadow: 0 18px 50px rgba(15, 10, 40, .30), 0 0 0 1px rgba(15, 10, 40, .10);
}
.panel.min .tabs, .panel.min .body { display: none; }
.head {
  display: flex; align-items: center; gap: 2px; padding: 8px 8px 8px 14px;
  background: #1e1b4b; color: #fff; cursor: move; user-select: none;
}
.head .title { flex: 1; font-weight: 700; font-size: 13px; letter-spacing: .2px; }
.icon-btn {
  border: 0; background: transparent; color: inherit; cursor: pointer;
  min-width: 28px; height: 28px; border-radius: 7px; font-size: 15px; line-height: 1;
  display: inline-flex; align-items: center; justify-content: center; padding: 0 6px;
}
.icon-btn:hover { background: rgba(255, 255, 255, .14); }
.icon-btn:disabled { opacity: .35; cursor: default; background: transparent; }
.icon-btn.on { background: #f59e0b; color: #2b1700; }
.pause-note { background: #fef3c7; color: #78350f; padding: 8px 14px; font-size: 12px; border-bottom: 1px solid #fde68a; }

.tabs { display: flex; gap: 2px; padding: 8px 8px 0; background: #f5f5fb; border-bottom: 1px solid #e6e4f0; }
.tab {
  flex: 1; border: 0; background: transparent; cursor: pointer; padding: 8px 2px 9px;
  font-weight: 600; font-size: 12px; color: #6b6880; border-radius: 8px 8px 0 0; white-space: nowrap;
}
.tab.active { background: #fff; color: #1e1b4b; box-shadow: 0 -1px 0 #e6e4f0, 1px 0 0 #e6e4f0, -1px 0 0 #e6e4f0; }
.body { overflow-y: auto; padding: 12px; flex: 1; }

.empty { text-align: center; padding: 22px 10px; color: #55526a; }
.empty .big { font-size: 34px; margin-bottom: 8px; }
.empty strong { display: block; color: #1e1b2e; font-size: 14px; margin-bottom: 6px; }
.empty ul { text-align: left; margin: 14px 0 0; padding-left: 18px; font-size: 12px; }
.empty li { margin: 4px 0; }

.card { background: #f5f5fb; border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; }
.el-name { font-weight: 700; font-size: 14px; }
.el-meta { color: #6b6880; font-size: 11px; margin-top: 2px; }
.row-btns { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.btn {
  border: 1px solid #d9d6e8; background: #fff; border-radius: 8px; padding: 6px 10px; cursor: pointer;
  font-size: 12px; font-weight: 600; color: #2e2a47;
}
.btn:hover { border-color: #4f46e5; color: #4f46e5; }
.btn.primary { background: #4f46e5; border-color: #4f46e5; color: #fff; }
.btn.primary:hover { background: #4338ca; color: #fff; }
.btn.danger { color: #b91c1c; }
.btn.danger:hover { border-color: #b91c1c; }
.btn.danger.confirm { background: #b91c1c; color: #fff; border-color: #b91c1c; }
.btn.block { width: 100%; margin-top: 6px; }
.hint { font-size: 11.5px; color: #6b6880; margin: 6px 0 10px; }
.hint b { color: #b45309; }

.seg { display: flex; background: #ecebf5; border-radius: 9px; padding: 3px; gap: 3px; }
.seg button {
  flex: 1; border: 0; background: transparent; border-radius: 7px; padding: 5px 4px; cursor: pointer;
  font-size: 12px; color: #4a4763;
}
.seg button.active { background: #fff; color: #1e1b4b; font-weight: 600; box-shadow: 0 1px 3px rgba(0, 0, 0, .12); }

details { border-top: 1px solid #eeedf5; }
details:first-of-type { border-top: 0; }
summary {
  list-style: none; cursor: pointer; padding: 10px 2px; font-weight: 700; font-size: 12.5px;
  display: flex; align-items: center; gap: 8px; user-select: none;
}
summary::-webkit-details-marker { display: none; }
summary::before { content: "▸"; color: #8b88a3; transition: transform .15s; }
details[open] > summary::before { transform: rotate(90deg); }
summary .dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; margin-left: auto; }
.group-body { padding: 0 2px 10px; }

.field { margin: 0 0 10px; }
.field-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.field-head label { font-size: 12px; color: #4a4763; }
.field.changed .field-head label { color: #1e1b4b; font-weight: 600; }
.field.changed .field-head label::after { content: " •"; color: #f59e0b; }
.reset { border: 0; background: transparent; cursor: pointer; color: #8b88a3; font-size: 13px; padding: 0 4px; border-radius: 5px; }
.reset:hover { color: #4f46e5; background: #ecebf5; }
.range { display: flex; align-items: center; gap: 8px; }
.range input[type=range] { flex: 1; accent-color: #4f46e5; min-width: 0; }
.num {
  width: 58px; border: 1px solid #d9d6e8; border-radius: 6px; padding: 3px 5px; font-size: 12px; text-align: right;
  background: #fff;
}
.unit { font-size: 11px; color: #8b88a3; width: 16px; }
select.sel-input {
  width: 100%; border: 1px solid #d9d6e8; border-radius: 8px; padding: 6px 8px; background: #fff; font-size: 12.5px;
}
.color { display: flex; align-items: center; gap: 8px; }
.color input[type=color] { width: 44px; height: 30px; border: 1px solid #d9d6e8; border-radius: 7px; padding: 2px; background: #fff; cursor: pointer; }
.color code { font-size: 11.5px; color: #6b6880; font-family: ui-monospace, Consolas, monospace; }
.swatches { display: flex; gap: 4px; flex-wrap: wrap; }
.swatch { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(0, 0, 0, .15); cursor: pointer; padding: 0; }

.spacing { position: relative; border: 1px dashed #c9c5de; border-radius: 10px; background: #fbf7ee; padding: 26px 46px; margin-top: 2px; }
.spacing .inner { position: relative; border: 1px dashed #b9b4d6; border-radius: 8px; background: #eef0ff; padding: 26px 46px; }
.spacing .content { background: #fff; border: 1px solid #d9d6e8; border-radius: 6px; height: 26px; font-size: 10px; color: #8b88a3; display: flex; align-items: center; justify-content: center; }
.spacing .cap { position: absolute; left: 8px; top: 5px; font-size: 9.5px; text-transform: uppercase; letter-spacing: .5px; color: #8b88a3; }
.spacing input {
  position: absolute; width: 40px; border: 1px solid transparent; background: transparent; border-radius: 5px;
  text-align: center; font-size: 11.5px; padding: 2px; color: #1e1b2e;
}
.spacing input:hover, .spacing input:focus { border-color: #a5a1c4; background: #fff; outline: none; }
.spacing input.set { color: #b45309; font-weight: 700; }
.spacing .t { top: 3px; left: 50%; transform: translateX(-50%); }
.spacing .b { bottom: 3px; left: 50%; transform: translateX(-50%); }
.spacing .l { left: 3px; top: 50%; transform: translateY(-50%); }
.spacing .r { right: 3px; top: 50%; transform: translateY(-50%); }

.presets { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.preset {
  border: 1px solid #d9d6e8; border-radius: 10px; background: #fff; cursor: pointer; padding: 8px; text-align: left;
}
.preset:hover { border-color: #4f46e5; }
.preset .pv { height: 44px; border-radius: 6px; margin-bottom: 6px; padding: 6px; display: flex; flex-direction: column; gap: 4px; }
.preset .pv i { display: block; height: 5px; border-radius: 3px; background: currentColor; opacity: .55; }
.preset .pv i:first-child { width: 60%; opacity: .9; height: 7px; }
.preset span { font-size: 12px; font-weight: 600; }
.switch-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; }
.switch { position: relative; width: 36px; height: 20px; flex: none; }
.switch input { opacity: 0; width: 0; height: 0; position: absolute; }
.switch span { position: absolute; inset: 0; background: #d4d1e3; border-radius: 999px; transition: .15s; cursor: pointer; }
.switch span::after { content: ""; position: absolute; width: 16px; height: 16px; left: 2px; top: 2px; background: #fff; border-radius: 50%; transition: .15s; box-shadow: 0 1px 2px rgba(0,0,0,.2); }
.switch input:checked + span { background: #4f46e5; }
.switch input:checked + span::after { transform: translateX(16px); }
.section-title { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: #8b88a3; font-weight: 700; margin: 4px 0 8px; }
.footer { border-top: 1px solid #eeedf5; margin-top: 12px; padding-top: 12px; }
.tpl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tpl {
  border: 2px solid #e6e4f0; border-radius: 11px; background: #fff; cursor: pointer; padding: 6px;
  text-align: left; display: flex; flex-direction: column; gap: 2px; transition: border-color .12s, transform .12s;
}
.tpl:hover { border-color: #a5a1f0; transform: translateY(-1px); }
.tpl.active { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, .15); }
.tpl-pv { height: 70px; border: 1px solid; overflow: hidden; margin-bottom: 4px; display: flex; flex-direction: column; }
.tpl-bar { height: 13px; display: flex; align-items: center; justify-content: space-between; padding: 0 5px; border-bottom: 1px solid; }
.tpl-bar i { display: block; height: 4px; width: 22px; border-radius: 2px; opacity: .8; }
.tpl-content { padding: 4px 6px; display: flex; flex-direction: column; gap: 3px; }
.tpl-content i { display: block; height: 3px; border-radius: 2px; opacity: .55; }
.tpl-h { font-size: 15px; font-weight: 700; line-height: 1; }
.tpl-btn { display: block; width: 28px; height: 8px; margin-top: 1px; }
.tpl-name { font-size: 12px; font-weight: 700; color: #1e1b2e; }
.tpl.active .tpl-name { color: #4f46e5; }
.tpl-desc { font-size: 10.5px; color: #6b6880; line-height: 1.3; }
.wf { height: 70px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 4px; display: flex; flex-direction: column; }
.wf-head { height: 12px; display: flex; align-items: center; justify-content: space-between; padding: 0 5px; flex: none; }
.wf-head i { display: block; width: 20px; height: 3px; border-radius: 2px; opacity: .7; }
.wf-head b { display: block; width: 12px; height: 5px; border-radius: 3px; }
.wf-body { flex: 1; padding: 5px 6px; display: flex; flex-direction: column; gap: 4px; min-height: 0; }
.wf-cards { display: grid; gap: 4px; }
.wf-card { display: block; height: 18px; border-radius: 4px; border: 1px solid; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.wf-col { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.wf-col.narrow { width: 62%; margin: 0 auto; }
.wf-line { display: block; height: 3px; border-radius: 2px; opacity: .55; }
.wf-split { display: flex; gap: 5px; flex: 1; }
.wf-side { display: block; width: 28%; border-radius: 3px; }

.feat-list { display: flex; flex-direction: column; gap: 6px; }
.feat { border: 1px solid #e6e4f0; border-radius: 10px; padding: 8px 10px; background: #fff; transition: border-color .12s, background .12s; }
.feat.on { border-color: #c7c4f5; background: #f7f6ff; }
.feat-main { display: flex; align-items: center; gap: 9px; cursor: pointer; }
.feat-icon { font-size: 17px; width: 22px; text-align: center; flex: none; }
.feat-text { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.feat-text b { font-size: 12.5px; color: #1e1b2e; }
.feat-text span { font-size: 11px; color: #6b6880; line-height: 1.3; }
.chips { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin: 7px 0 0 31px; font-size: 11px; color: #6b6880; }
.chip { border: 1px solid #d9d6e8; background: #fff; border-radius: 999px; padding: 3px 10px; font-size: 11px; cursor: pointer; color: #4a4763; }
.chip:hover { border-color: #4f46e5; }
.chip.active { background: #4f46e5; border-color: #4f46e5; color: #fff; font-weight: 600; }
.toast {
  position: fixed; z-index: 20; left: 50%; bottom: 24px; transform: translateX(-50%);
  background: #1e1b4b; color: #fff; padding: 8px 14px; border-radius: 9px; font-size: 12.5px;
  box-shadow: 0 8px 24px rgba(0,0,0,.25); pointer-events: none;
}
`;
