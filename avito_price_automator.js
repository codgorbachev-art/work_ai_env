/**
 * Скрипт автоматизации установки минимальных цен на Авито (Версия 15 - First Field 40).
 * Инструкция:
 * 1. Создайте закладку в браузере.
 * 2. В поле URL вставьте код ниже (начиная с javascript:).
 * 3. На странице Авито нажмите на закладку.
 */

/*
javascript:(async function(){const wait=ms=>new Promise(r=>setTimeout(r,ms));const simulateKey=(el,key,code)=>{el.dispatchEvent(new KeyboardEvent("keydown",{bubbles:!0,cancelable:!0,key:key,code:code,keyCode:code==="Enter"?13:9,which:code==="Enter"?13:9}));el.dispatchEvent(new KeyboardEvent("keypress",{bubbles:!0,cancelable:!0,key:key,code:code,keyCode:code==="Enter"?13:9,which:code==="Enter"?13:9}));el.dispatchEvent(new KeyboardEvent("keyup",{bubbles:!0,cancelable:!0,key:key,code:code,keyCode:code==="Enter"?13:9,which:code==="Enter"?13:9}))};const setVal=(el,val)=>{el.focus();const setter=Object.getOwnPropertyDescriptor(el,"value").set;const proto=Object.getPrototypeOf(el);const protoSetter=Object.getOwnPropertyDescriptor(proto,"value").set;if(protoSetter&&protoSetter!==setter){protoSetter.call(el,val)}else{setter.call(el,val)}el.dispatchEvent(new Event("input",{bubbles:!0}));el.dispatchEvent(new Event("change",{bubbles:!0}));simulateKey(el,"Enter","Enter");el.blur()};const debugPanel=document.createElement("div");debugPanel.style.cssText="position:fixed;top:10px;right:10px;background:black;color:white;padding:5px;z-index:9999;font-size:12px;opacity:0.8";document.body.appendChild(debugPanel);const updateDebug=(text)=>debugPanel.innerText=text;updateDebug("🚀 V15 First=40...");window.scrollTo(0,0);await wait(200);let totalProcessed=0,processedSet=new Set();while(true){const allInputs=document.querySelectorAll("input");let screenInputs=[];for(let el of allInputs){if(!processedSet.has(el)){let isBad=false;let parent=el.closest('div[class*="root"]');if(!parent)parent=el.closest('div[class*="style-item-"]');if(!parent)parent=el.parentElement.parentElement.parentElement;if(parent){const t=parent.innerText.toLowerCase();if(t.includes("тратить")||t.includes("день")||t.includes("бюджет"))isBad=true;}if(isBad){el.style.outline="3px solid red";continue}const val=el.value||"";const pText=el.parentElement?el.parentElement.innerText:"";if(val.includes("₽")||pText.includes("₽")||el.type==="tel"||(el.type==="text"&&!isNaN(parseFloat(val)))){screenInputs.push({el,parent})}}}updateDebug(`👀 Найдено: ${screenInputs.length} | Итого: ${totalProcessed}`);if(screenInputs.length>0){const promises=screenInputs.map(async({el,parent},index)=>{processedSet.add(el);try{el.style.outline="3px solid blue";const isGlobalFirst=(totalProcessed===0&&index===0);const targetVal=isGlobalFirst?"40":"0";setVal(el,targetVal);document.body.click();await wait(200);if(isGlobalFirst){el.style.outline="3px solid purple";totalProcessed++;return}if(el.value!=="0"&&el.value!==""){el.style.outline="3px solid green";totalProcessed++;return}const text=parent?parent.innerText:"";const match=text.match(/Минимальн[а-я]+\s*(?:цена|ставка).*?(\d+)/i)||text.match(/(\d+)\s*₽/);if(match){const minPrice=match[1];if(el.value.replace(/\D/g,'')!==minPrice){setVal(el,minPrice);el.blur();el.style.outline="3px solid green";totalProcessed++}else{el.style.outline="3px solid green"}}else{el.style.outline="3px solid orange"}}catch(e){console.error(e)}});await Promise.all(promises);await wait(100)}if((window.innerHeight+window.scrollY)>=document.body.offsetHeight-10){updateDebug(`🏁 Финиш! ${totalProcessed}`);alert(`Готово V15! Обработано строк: ${totalProcessed}`);break}window.scrollBy(0,window.innerHeight*0.9);await wait(250)}})();
*/

// Развернутая версия для чтения/отладки:
(async function () {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const simulateKey = (el, key, code) => {
        const options = { bubbles: true, cancelable: true, key: key, code: code, keyCode: code === "Enter" ? 13 : 9, which: code === "Enter" ? 13 : 9 };
        el.dispatchEvent(new KeyboardEvent("keydown", options));
        el.dispatchEvent(new KeyboardEvent("keypress", options));
        el.dispatchEvent(new KeyboardEvent("keyup", options));
    };

    const setVal = (el, val) => {
        el.focus();
        const setter = Object.getOwnPropertyDescriptor(el, "value").set;
        const proto = Object.getPrototypeOf(el);
        const protoSetter = Object.getOwnPropertyDescriptor(proto, "value").set;
        if (protoSetter && protoSetter !== setter) { protoSetter.call(el, val); } else { setter.call(el, val); }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        simulateKey(el, "Enter", "Enter");
        el.blur();
    };

    const debugPanel = document.createElement("div");
    debugPanel.style.cssText = "position:fixed;top:10px;right:10px;background:black;color:white;padding:5px;z-index:9999;font-size:12px;opacity:0.8";
    document.body.appendChild(debugPanel);
    const updateDebug = (text) => debugPanel.innerText = text;

    updateDebug("🚀 V15 First=40...");
    window.scrollTo(0, 0);
    await wait(200);

    let totalProcessed = 0;
    let processedSet = new Set();

    while (true) {
        const allInputs = document.querySelectorAll("input");
        let screenInputs = [];

        for (let el of allInputs) {
            if (!processedSet.has(el)) {
                let isBad = false;
                let parent = el.closest('div[class*="root"]');
                if (!parent) parent = el.closest('div[class*="style-item-"]');
                if (!parent) parent = el.parentElement.parentElement.parentElement;
                if (parent) {
                    const t = parent.innerText.toLowerCase();
                    if (t.includes("тратить") || t.includes("день") || t.includes("бюджет")) isBad = true;
                }
                if (isBad) { el.style.outline = "3px solid red"; continue; }
                const val = el.value || "";
                const pText = el.parentElement ? el.parentElement.innerText : "";
                if (val.includes("₽") || pText.includes("₽") || el.type === "tel" || (el.type === "text" && !isNaN(parseFloat(val)))) {
                    screenInputs.push({ el, parent });
                }
            }
        }

        updateDebug(`👀 Найдено: ${screenInputs.length} | Итого: ${totalProcessed}`);

        if (screenInputs.length > 0) {
            const promises = screenInputs.map(async ({ el, parent }, index) => {
                processedSet.add(el);
                try {
                    el.style.outline = "3px solid blue";

                    // --- ЛОГИКА ДЛЯ ПЕРВОГО ЭЛЕМЕНТА ---
                    // Если это самый первый элемент за весь проход скрипта
                    const isGlobalFirst = (totalProcessed === 0 && index === 0);

                    const targetVal = isGlobalFirst ? "40" : "0";

                    setVal(el, targetVal);
                    document.body.click();
                    await wait(200);

                    // Если это первый элемент, мы просто ставим 40 и выходим (не ищем мин. цену)
                    if (isGlobalFirst) {
                        el.style.outline = "3px solid purple"; // Фиолетовый для 1-го
                        totalProcessed++;
                        return;
                    }

                    // Для остальных:
                    if (el.value !== "0" && el.value !== "") {
                        el.style.outline = "3px solid green";
                        totalProcessed++;
                        return;
                    }

                    const text = parent ? parent.innerText : "";
                    const match = text.match(/Минимальн[а-я]+\s*(?:цена|ставка).*?(\d+)/i) || text.match(/(\d+)\s*₽/);
                    if (match) {
                        const minPrice = match[1];
                        if (el.value.replace(/\D/g, '') !== minPrice) {
                            setVal(el, minPrice);
                            el.blur();
                            el.style.outline = "3px solid green";
                            totalProcessed++;
                        } else {
                            el.style.outline = "3px solid green";
                        }
                    } else {
                        el.style.outline = "3px solid orange";
                    }
                } catch (e) {
                    console.error(e);
                }
            });
            await Promise.all(promises);
            await wait(100);
        }

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
            updateDebug(`🏁 Финиш! ${totalProcessed}`);
            alert(`Готово V15! Обработано строк: ${totalProcessed}`);
            break;
        }

        window.scrollBy(0, window.innerHeight * 0.9);
        await wait(250);
    }
})();
