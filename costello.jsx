/**
 * @name Costello
 * @author Jason Liang
 * @description Save and send a collection of images right inside Discord
 * @version 0.0.2
 * @source https://github.com/jasonliang-dev/costello
 *
 * See end of file for license information
 */

// eslint-disable-next-line no-undef
const { React } = BdApi;

const IFRAME_ID = "liang-costello-iframe";
const APP_ID = "liang-costello-app";
const CSS_ID = "liang-costello-css";

const MODE_SEARCH = "MODE_SEARCH";
const MODE_EDIT = "MODE_EDIT";

const WINDOWS_TOPBAR_OFFSET = 21;
const ALIGN_MENU_X_OFFSET = 65;

function useLocalStorage(key, value, store) {
  let realValue;

  try {
    realValue = JSON.parse(store.getItem(key)) || value;
  } catch (e) {
    BdApi.showToast(`[Costello] Could not parse value in localStorage.`, {
      type: "error",
    });

    realValue = value;
  }

  const [stored, setStored] = React.useState(realValue);

  function set(updated) {
    setStored(updated);
    store.setItem(key, JSON.stringify(updated));
  }

  return [stored, set];
}

const BigInputBar = React.forwardRef(({ value, change, icon }, ref) => (
  <div
    style={{
      backgroundColor: "var(--background-tertiary)",
      display: "flex",
      alignItems: "center",
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      borderRadius: "0.25rem",
    }}
  >
    {React.cloneElement(icon)}
    <input
      ref={ref}
      style={{
        border: 0,
        backgroundColor: "transparent",
        paddingTop: "0.75rem",
        paddingBottom: "0.75rem",
        color: "var(--text-normal)",
        placeholder: "Search for stickers",
        flex: "1 1 0%",
        fontSize: "1rem",
      }}
      type="text"
      value={value}
      onChange={change}
    />
  </div>
));

function OverflowContainer({ children }) {
  return (
    <div style={{ paddingTop: "1rem" }}>
      <div
        style={{
          paddingLeft: "1rem",
          paddingRight: "1rem",
          height: "24rem",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        className="liang-scrollbar"
      >
        {children}
      </div>
    </div>
  );
}

function StickerSearch({ search, setSearch, searchBarEl, stickers, store }) {
  const sendImage = (link) => {
    const channel = window.location.href.split("/").slice(-1)[0];

    const token = store.getItem("token");
    if (!token) {
      BdApi.showToast(`[Costello] Cannot get user token.`, {
        type: "error",
      });
      return;
    }

    fetch(`https://discordapp.com/api/channels/${channel}/messages`, {
      headers: {
        Authorization: token.replace(/"/g, ""),
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ content: link }),
    })
      .then((res) => {
        if (res.status !== 200) {
          BdApi.showToast(`[Costello] HTTP ${res.status}`, {
            type: "error",
          });
        }
      })
      .catch((err) => {
        console.error(err);
        BdApi.showToast("[Costello] Unknown error. See console for details", {
          type: "error",
        });
      });
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          console.log("hi");

          const remaining = stickers.filter(
            (s) => s.name.toLowerCase().indexOf(search.toLowerCase()) !== -1
          );

          if (remaining.length > 0) {
            sendImage(remaining[0].link);
          }
        }}
        style={{ padding: "0 1rem" }}
      >
        <BigInputBar
          ref={searchBarEl}
          value={search}
          change={(e) => setSearch(e.target.value)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "1.5rem",
                height: "1.5rem",
                paddingRight: "0.5rem",
                color: "var(--text-muted)",
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
      </form>
      <OverflowContainer>
        {stickers.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "4rem", height: "4rem", paddingBottom: "1rem" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              No stickers yet.
            </span>
          </div>
        ) : (
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: "1rem",
              paddingBottom: "1rem",
            }}
          >
            {stickers.map((sticker) => (
              <li
                key={sticker.link}
                style={{
                  display:
                    sticker.name.toLowerCase().indexOf(search.toLowerCase()) ===
                    -1
                      ? "none"
                      : "block",
                  textAlign: "center",
                }}
              >
                <button
                  style={{
                    padding: "0.5rem",
                    borderRadius: "0.25rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                  className="liang-bg-secondary h:liang-bg-accent"
                  type="button"
                  onClick={() => sendImage(sticker.link)}
                >
                  <img
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "4rem",
                    }}
                    alt=""
                    src={sticker.link}
                  />
                </button>
                <span
                  style={{
                    color: "var(--text-normal)",
                    display: "inline-block",
                    paddingTop: "0.25rem",
                  }}
                >
                  {sticker.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </OverflowContainer>
    </>
  );
}

function StickerEdit({ stickers, setStickers, editBarEl }) {
  const [edit, setEdit] = React.useState("");

  return (
    <>
      <form
        style={{ display: "flex", padding: "0 1rem" }}
        onSubmit={(e) => {
          e.preventDefault();

          if (edit.trim() !== "") {
            const split = edit.split(" ");

            setStickers([
              ...split.map((link) => ({
                name: link.replace(/^.*\//, ""),
                link,
              })),
              ...stickers,
            ]);
          }

          setEdit("");
        }}
      >
        <div style={{ flex: "1 1 0%" }}>
          <BigInputBar
            ref={editBarEl}
            value={edit}
            change={(e) => setEdit(e.target.value)}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  paddingRight: "0.5rem",
                  color: "var(--text-muted)",
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            }
          />
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              "hsl(139, calc(var(--saturation-factor, 1) * 47.3%), 43.9%)",
            borderRadius: "0.25rem",
            marginLeft: "1rem",
            color: "white",
            width: "5rem",
          }}
          type="submit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "1.25rem", height: "1.25rem" }}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add
        </button>
      </form>
      <OverflowContainer>
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "1rem",
            paddingBottom: "1rem",
          }}
        >
          {stickers.map((sticker) => (
            <li
              style={{ display: "flex", alignItems: "center" }}
              className="liang-group"
              key={sticker.link}
            >
              <img
                style={{
                  width: "4rem",
                  height: "4rem",
                  paddingRight: "1rem",
                  objectFit: "contain",
                }}
                alt=""
                src={sticker.link}
              />
              <input
                name=""
                style={{
                  border: 0,
                  backgroundColor: "var(--background-tertiary)",
                  color: "var(--text-normal)",
                  fontSize: "1rem",
                  borderRadius: "0.25rem",
                  flex: "1 1 0%",
                  width: "100%",
                  padding: "0.25rem 0.5rem",
                }}
                type="text"
                value={sticker.name}
                onChange={(e) =>
                  setStickers(
                    stickers.map((s) =>
                      s.name === sticker.name
                        ? { name: e.target.value, link: s.link }
                        : s
                    )
                  )
                }
              />
              <button
                style={{
                  backgroundColor: "transparent",
                  color: "var(--text-danger)",
                  alignItems: "center",
                }}
                className="liang-invisible gh:liang-visible"
                type="button"
                onClick={() =>
                  setStickers(stickers.filter((s) => s.name !== sticker.name))
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "1.25rem", height: "1.25rem" }}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </OverflowContainer>
    </>
  );
}

function App({ store }) {
  const [mode, setMode] = React.useState(MODE_SEARCH);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [stickers, setStickers] = useLocalStorage("liang-costello", [], store);
  const [search, setSearch] = React.useState("");
  const [menuPlacement, setMenuPlacement] = React.useState({ x: 0, y: 0 });
  const [buttonPlacement, setButtonPlacement] = React.useState({ x: 0, y: 0 });
  const searchBarEl = React.useRef(null);
  const editBarEl = React.useRef(null);
  const buttonEl = React.useRef(null);
  const menuEl = React.useRef(null);

  React.useEffect(() => {
    const isWindows = document.querySelector("html.platform-win");
    const offsetY = isWindows ? WINDOWS_TOPBAR_OFFSET : 0;

    function stayInPlace() {
      const textarea = document.querySelector("[class^=channelTextArea]");

      if (textarea) {
        const menuRect = textarea.getBoundingClientRect();

        setMenuPlacement({
          x: menuRect.right - ALIGN_MENU_X_OFFSET,
          y: menuRect.top - offsetY,
        });
      }

      const textareaButtons = document.querySelector(
        "[class^=channelTextArea] [class^=buttons]"
      );

      if (textareaButtons) {
        const buttonRect = textareaButtons.getBoundingClientRect();
        setButtonPlacement({
          // move 105px from the button group. not moving the button will overlap
          x: buttonRect.left - 105,
          y: buttonRect.top - offsetY,
        });
      }
    }

    const interval = window.setInterval(stayInPlace, 1600);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  React.useEffect(() => {
    function closeMenuOnOutsideClick(event) {
      if (buttonEl.current === null || menuEl.current === null) {
        return;
      }

      const isWindows = document.querySelector("html.platform-win");
      const offsetY = isWindows ? WINDOWS_TOPBAR_OFFSET : 0;

      // revert offsets from menuPlacement
      const mouse = {
        x: event.clientX - ALIGN_MENU_X_OFFSET,
        y: event.clientY - offsetY,
      };

      // element may have been removed. check if mouse is inside menu
      // instead of checking if clicked elemenent was a child of the
      // menu
      const mel = menuEl.current;
      const mouseInsideMenu =
        mel.offsetLeft <= mouse.x &&
        mouse.x <= mel.offsetLeft + mel.offsetWidth &&
        mel.offsetTop <= mouse.y &&
        mouse.y <= mel.offsetTop + mel.offsetHeight;

      if (!buttonEl.current.contains(event.target) && !mouseInsideMenu) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, []);

  const openMenu = React.useCallback(() => {
    setMenuOpen(true);
    setMode(MODE_SEARCH);
    setSearch("");
    if (searchBarEl.current !== null) {
      searchBarEl.current.focus();
    }
  }, []);

  React.useEffect(() => {
    function onKeyPress(event) {
      if (event.ctrlKey && event.shiftKey && event.code === "KeyX") {
        openMenu();
      } else if (event.code === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyPress);

    return () => {
      document.removeEventListener("keydown", onKeyPress);
    };
  }, [openMenu, mode]);

  return (
    <div style={{ position: "absolute", zIndex: 110 }}>
      <button
        ref={buttonEl}
        type="button"
        onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
        style={{
          left: buttonPlacement.x,
          top: buttonPlacement.y,
          height: 44, // the default height of textarea (when theres one line of text)
          display: "flex",
          alignItems: "center",
          position: "absolute",
          backgroundColor: "transparent",
        }}
        className="liang-interactive-normal h:liang-interactive-active"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "1.5rem", height: "1.5rem" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>
      <div
        ref={menuEl}
        style={(() => {
          const width = 600;
          const defaultHeight = 514;
          const height = menuEl.current ? menuEl.current.offsetHeight || defaultHeight : defaultHeight;
          const margin = 8;

          return {
            left: menuPlacement.x - width - margin,
            top: menuPlacement.y - height - margin,
            display: menuOpen ? "block" : "none",
            position: "absolute",
            backgroundColor: "var(--background-primary)",
            color: "white",
            borderRadius: "0.5rem",
            textAlign: "left",
            boxShadow: "var(--elevation-stroke), var(--elevation-high)",
            width,
          };
        })()}
      >
        <div style={{ paddingTop: "1rem" }}>
          <div style={{ display: mode === MODE_SEARCH ? "block" : "none" }}>
            <StickerSearch
              search={search}
              setSearch={setSearch}
              searchBarEl={searchBarEl}
              stickers={stickers}
              store={store}
            />
          </div>
          <div style={{ display: mode === MODE_EDIT ? "block" : "none" }}>
            <StickerEdit
              editBarEl={editBarEl}
              stickers={stickers}
              setStickers={setStickers}
            />
          </div>
        </div>
        <div
          style={{
            backgroundColor: "var(--background-secondary)",
            borderBottomLeftRadius: "0.5rem",
            borderBottomRightRadius: "0.5rem",
            padding: "0.5rem",
            textAlign: "right",
          }}
        >
          {(() => {
            const buttonStyle = {
              borderRadius: "0.25rem",
              backgroundColor: "var(--background-secondary-alt)",
              color: "var(--text-normal)",
              fontSize: "1rem",
              padding: "0.5rem 2rem",
            };

            switch (mode) {
              case MODE_SEARCH:
                return (
                  <button
                    style={buttonStyle}
                    type="button"
                    onClick={() => setMode(MODE_EDIT)}
                  >
                    Add/Remove Stickers
                  </button>
                );
              case MODE_EDIT:
                return (
                  <button
                    style={buttonStyle}
                    type="button"
                    onClick={() => setMode(MODE_SEARCH)}
                  >
                    Back
                  </button>
                );
              default:
                return null;
            }
          })()}
        </div>
      </div>
    </div>
  );
}

class Costello {
  // eslint-disable-next-line class-methods-use-this
  start() {
    const iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    const store = document.head.appendChild(iframe).contentWindow.frames
      .localStorage;

    function mount() {
      console.log("[Costello] mount()");

      const mountTarget = document.querySelector(
        "[class*=baseLayer] > [class*=container] > [class*=base]"
      );
      if (!mountTarget) {
        setTimeout(mount, 500);
        return;
      }

      // eslint wants react version since it's not listed in package.json
      // console.log(`[Costello] react version ${React.version}`);

      console.log("[Costello] mounting app");

      let applicationContainer = document.getElementById(APP_ID);
      if (!applicationContainer) {
        applicationContainer = document.createElement("div");
        applicationContainer.id = APP_ID;
        mountTarget.prepend(applicationContainer);
      } else if (applicationContainer.children.length !== 0) {
        BdApi.showToast(
          "[Costello] Something went terribly wrong. Cannot mount app",
          { type: "error" }
        );
      }

      BdApi.ReactDOM.render(<App store={store} />, applicationContainer);
      console.log("[Costello] mounted");

      BdApi.injectCSS(
        CSS_ID,
        `
          .liang-invisible {
            visibility: hidden;
          }
          .liang-group:hover .gh\\:liang-visible {
            visibility: visible;
          }
          .liang-bg-secondary {
            background-color: var(--background-secondary);
          }
          .h\\:liang-bg-accent:hover {
            background-color: var(--background-accent);
          }
          .liang-interactive-normal {
            color: var(--interactive-normal);
          }
          .h\\:liang-interactive-active:hover {
            color: var(--interactive-active);
          }
          .liang-scrollbar::-webkit-scrollbar {
            width: 0.5rem;
          }
          .liang-scrollbar::-webkit-scrollbar-track {
            background: var(--scrollbar-auto-track);
            border-radius: 9999px;
          }
          .liang-scrollbar::-webkit-scrollbar-thumb {
            background: var(--scrollbar-auto-thumb);
            border-radius: 9999px;
          }
        `
      );
    }

    mount();
  }

  // eslint-disable-next-line class-methods-use-this
  stop() {
    console.log("[Costello] stopping");

    document.head.removeChild(document.getElementById(IFRAME_ID));
    BdApi.ReactDOM.unmountComponentAtNode(document.getElementById(APP_ID));

    BdApi.clearCSS(CSS_ID);

    console.log("[Costello] stopped");
  }
}

module.exports = Costello;

/*
------------------------------------------------------------------------------
This software is available under 2 licenses -- choose whichever you prefer.
------------------------------------------------------------------------------
ALTERNATIVE A - MIT License
Copyright (c) 2021 Jason Liang
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
------------------------------------------------------------------------------
ALTERNATIVE B - Public Domain (www.unlicense.org)
This is free and unencumbered software released into the public domain.
Anyone is free to copy, modify, publish, use, compile, sell, or distribute this
software, either in source code form or as a compiled binary, for any purpose,
commercial or non-commercial, and by any means.
In jurisdictions that recognize copyright laws, the author or authors of this
software dedicate any and all copyright interest in the software to the public
domain. We make this dedication for the benefit of the public at large and to
the detriment of our heirs and successors. We intend this dedication to be an
overt act of relinquishment in perpetuity of all present and future rights to
this software under copyright law.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
------------------------------------------------------------------------------
*/
