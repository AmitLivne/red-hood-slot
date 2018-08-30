const symbols = [{
    id: '1',
    url: './img/symbols/symbolBabcia.png'
},
{
    id: '2',
    url: './img/symbols/symbolChata.png'
},
{
    id: '3',
    url: './img/symbols/symbolLowca.png'
},
{
    id: '4',
    url: './img/symbols/symbolScatter.png'
},
{
    id: '5',
    url: './img/symbols/symbolSerce.png'
},
{
    id: '6',
    url: './img/symbols/symbolWild.png'
},
{
    id: '7',
    url: './img/symbols/symbolWilka.png'
}
]

// --- Global Variables --- //

const REELS_COUNT = 3;
const MIN_SPIN_TIME = 2100;
let time = 2100;
const REELS_SPIN_INTERVAL_VALUE = 100;
let reelsIntervals = [];
let spinBtnInterval;
let jackpotInterval;
let operators = Array.from({ length: REELS_COUNT }, () => 0);
let elReels;
let victoryIdxs = [2, 4, 2];
// let reelsRedWoodIdxs = [], victoryMoves = [];
let clicksCount = 0;
let startTime;
let stopTime;
let totalTime;
let isSpinning;
let isStopped = false;
let isFirstSpin = true;
let isAlreadyWon = false;
let timeToStop = 0;

// --- Render 3 reels --- //

function renderReels() {

    let elSlotContainer = document.querySelector('.slot-container');
    let reelStrHtml = ``;

    for (let i = 1; i <= REELS_COUNT; i++) {

        reelStrHtml += `
        <div class="reel-slider reel-slider${i}">
            <ul class="reel reel${i}">
            </ul>
        </div>
        `
    }
    elSlotContainer.innerHTML = reelStrHtml;
    renderSymbols()
}

// --- For every reel, render symbols --- //

function renderSymbols() {
    elReels = document.querySelectorAll('.reel');

    elReels.forEach((reel, idx) => {
        let symbolStrHtml = ``;
        shuffle(idx);

        symbols.forEach((symbol, idx) => {
            symbolStrHtml += `
            <li class="symbol symbol${symbol.id}" style="background-image: url('${symbol.url}')">
                <div class="stars star${symbol.id}">
                </div>
            </li>
            `
        })

        let elReel = document.querySelector(`.reel${idx + 1}`);
        elReel.innerHTML = symbolStrHtml;
    })
    setButtonInterval()
    // calcMoves()
}

// --- Activate slot --- //

function spinReels() {
    if (!startTime) startTime = Date.now();

    // Prevent multiple clicks
    if (clicksCount > 1) return;

    // User want to stop spinning
    else if (isSpinning) {
        stopTime = Date.now();
        isStopped = true;
        isFirstSpin = false;
        stopReelsSpin();
    } else {

        // Reels will stop automatically
        isSpinning = true;
        let elWildSymbols = document.querySelectorAll(`.symbol6 div`);
        showStars(elWildSymbols, 'none')

        progressJackpot()
        clearInterval(spinBtnInterval);

        elReels.forEach((elReel, idx) => {
            reelsIntervals[idx] = setInterval(() => {
                setTimeout(() => {
                    if (idx === 0) {
                        if (elReel.children.item(victoryIdxs[0]).classList.contains('symbol6')) {
                            clearInterval(reelsIntervals[idx])
                        }
                    }
                    else if (idx === 1) {
                        setTimeout(() => {
                            if (elReel.children.item(victoryIdxs[1]).classList.contains('symbol6')) {
                                clearInterval(reelsIntervals[idx])
                            }
                        }, 900)

                    } else {

                        setTimeout(() => {
                            if (elReel.children.item(victoryIdxs[2]).classList.contains('symbol6')) {
                                clearInterval(reelsIntervals[idx])
                            }
                        }, 1800)
                    }

                }, time)

                // Organize each reel elements
                let elImgs = document.querySelectorAll(`.reel${idx + 1} li`);
                let elSlider = document.querySelector(`.reel-slider${idx + 1}`);
                let currTranslate = getPosition(elSlider);
                let elImgWidth = document.querySelector(`li`).clientWidth;
                let lastImg = elImgs[symbols.length - 1].cloneNode(true);
                operators[idx] += elImgWidth

                elReel.insertBefore(lastImg, elReel.firstChild);
                elReel.removeChild(elImgs[symbols.length - 1]);

                elSlider.style.transform = `translateY(${currTranslate - elImgWidth}px)`;
                elReel.style.transform = `translateY(${operators[idx]}px)`;
                elReel.style.transition = 'transform 0.2s ease-out'
                time = time - 100;
            }, REELS_SPIN_INTERVAL_VALUE);
        })

        setTimeout(() => {
            if (!isStopped) {
                stopReelsSpin()
            }
        }, MIN_SPIN_TIME + 600)
    }
    displayElements('none', 300, '0')
    clicksCount++;
}

// --- Shuffle symbols to get a random position for each one --- //

function shuffle(idx) {
    let i, j, temp;
    for (i = symbols.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = symbols[i];
        symbols[i] = symbols[j];
        symbols[j] = temp;
    }

    // reelsRedWoodIdxs[idx] = symbols.findIndex((symbol) => {
    //     return symbol.id === '6'
    // })
    return symbols;
}

// --- Manage button animation --- //

function setButtonInterval() {
    let elBtnTop = document.querySelector(`.spin-btn-shadow-top`);
    let elBtnBottom = document.querySelector(`.spin-btn-shadow-bottom`);
    spinBtnInterval = setInterval(() => {
        elBtnTop.style.visibility = (elBtnTop.style.visibility === 'visible') ? 'hidden' : 'visible';
        elBtnBottom.style.visibility = (elBtnBottom.style.visibility === 'visible') ? 'hidden' : 'visible';
    }, 250)
}

// --- stop slot --- //

function stopReelsSpin() {

    isSpinning = false;
    let elWildSymbols = document.querySelectorAll(`.symbol6 div`);

    if (isStopped) {
        totalTime = stopTime - startTime;
        reelsIntervals.forEach((reelInterval, idx) => {
            clearInterval(reelInterval)
        })
    } else if (!isAlreadyWon) {
        showStars(elWildSymbols, 'block')
        isAlreadyWon = true;
    }

    clearInterval(jackpotInterval);
    setButtonInterval()

    setTimeout(() => {
        isStopped = false;
        clicksCount = 0;
    }, MIN_SPIN_TIME + 600)

    setTimeout(() => {
        displayElements('block', 0, '1')
    }, timeToStop + 200)
    timeToStop = 0;
}

// --- Manage elements animation --- //

function displayElements(display, tranform, opacity) {
    let elRedHood = document.querySelector(`.redhood-character`);
    let elArrow = document.querySelector(`.arrow`);
    let elHand = document.querySelector(`.hand`);
    elArrow.style.display = display;
    elRedHood.style.transform = `translate(${tranform}px)`;
    elRedHood.style.transition = 'transform 0.5s ease-out'
    elHand.style.opacity = opacity;
    elHand.style.transition = 'opacity 0.5s ease-out'
}

// --- Increment Jackpot --- //

function progressJackpot() {
    let elPeriod1 = (document.querySelector('.period1'))
    let elPeriod2 = (document.querySelector('.period2'))
    let elPeriod1value = parseInt(elPeriod1.innerHTML)
    let elPeriod2value = parseInt(elPeriod2.innerHTML)
    let elComma = document.querySelector('.comma')

    // Handel comma issue
    jackpotInterval = setInterval(() => {
        if (elPeriod2value === 999) {
            elPeriod2value = 1;
            elPeriod1.innerHTML = elPeriod1value + 1;
            elComma.innerHTML = ',00'
        } else if (elPeriod2value === 9) {
            elPeriod2value += 1;
            elComma.innerHTML = ',0'
        } else if (elPeriod2value === 99) {
            elPeriod2value += 1;
            elComma.innerHTML = ','
        } else {
            elPeriod2value += 1;
        }
        elPeriod2.innerHTML = elPeriod2value;
    }, 100);
}

// --- Get element current position --- //

function getPosition(el) {
    let style = window.getComputedStyle(el);
    let matrix = new WebKitCSSMatrix(style.webkitTransform);
    return matrix.m42;
}

// --- Define moves count for victory --- //

// function calcMoves() {
//     reelsRedWoodIdxs.forEach((reelsRedWoodIdx, idx) => {
//         victoryMoves[idx] = (reelsRedWoodIdx <= victoryIdxs[idx]) ? (victoryIdxs[idx] - reelsRedWoodIdx) :
//             (symbols.length - reelsRedWoodIdx) + victoryIdxs[idx]
//     })
// }

// --- Show stars frame --- //

function showStars(elWildSymbols) {
    elWildSymbols.forEach((elWildSymbol, idx) => {
        elWildSymbol.style.display = 'block'
    })
}