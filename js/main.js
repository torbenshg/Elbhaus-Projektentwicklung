// Neubau-Angebotsmieten: Balken und Beschriftung wachsen gemeinsam.
document.querySelectorAll('.rent-chart').forEach(chart => {
  const groups = Array.from(chart.querySelectorAll('.rent-bar-group')).map(group => ({
    value: Number(group.dataset.value),
    bar: group.querySelector('.rent-bar'),
    label: group.querySelector('.rent-amount')
  }));
  const format = value => value.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const paint = progress => groups.forEach(({value, bar, label}) => {
    const current = value * progress;
    const height = current / 30 * 300;
    bar.setAttribute('y', 344 - height);
    bar.setAttribute('height', height);
    label.setAttribute('y', 330 - height);
    label.textContent = format(current);
  });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  paint(0);
  const animate = () => {
    let start;
    const tick = time => {
      if (start === undefined) start = time;
      const fraction = Math.min(1, (time - start) / 2400);
      const progress = fraction < .5 ? 4 * fraction ** 3 : 1 - (-2 * fraction + 2) ** 3 / 2;
      paint(progress);
      if (fraction < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!('IntersectionObserver' in window)) { animate(); return; }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      animate();
    }
  }, {threshold: .22});
  observer.observe(chart);
});


// Keep the illustration highlight independent of the linked card's navigation.
(() => {
  const initializeScenarioHover = () => {
    document.querySelectorAll('.value-cases-grid .value-case').forEach(card => {
      const shapes = card.querySelectorAll('.value-new-volume, .value-new-boundary');
      const highlight = () => {
        shapes.forEach(shape => {
          shape.style.setProperty('stroke-dasharray', 'none', 'important');
          shape.style.setProperty('stroke-width', '2.4', 'important');
          if (shape.classList.contains('value-new-volume')) {
            shape.style.setProperty('fill', 'rgba(18, 51, 75, 0.25)', 'important');
          }
        });
      };
      const reset = () => {
        shapes.forEach(shape => {
          shape.style.removeProperty('stroke-dasharray');
          shape.style.removeProperty('stroke-width');
          shape.style.removeProperty('fill');
        });
      };
      card.addEventListener('mouseenter', highlight);
      card.addEventListener('pointerenter', highlight);
      card.addEventListener('focus', highlight);
      card.addEventListener('pointerdown', highlight);
      card.addEventListener('mouseleave', reset);
      card.addEventListener('pointerleave', reset);
      card.addEventListener('blur', reset);
      card.addEventListener('pointercancel', reset);
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScenarioHover, { once: true });
  } else {
    initializeScenarioHover();
  }
})();


// Gemeinsame Navigation und Anfrage für alle Seiten.
// Rotate the original line drawing as one unit on the actual button events.
(() => {
  const initializeArrowButtons = () => {
    document.querySelectorAll('.owner-hero .primary-cta').forEach(button => {
      let releaseTimer;
      const activate = () => {
        clearTimeout(releaseTimer);
        button.classList.add('is-touch-active');
        button.style.setProperty('background-color', '#12334b', 'important');
        button.style.setProperty('color', '#fff', 'important');
      };
      const reset = () => {
        clearTimeout(releaseTimer);
        button.classList.remove('is-touch-active');
        button.style.removeProperty('background-color');
        button.style.removeProperty('color');
      };
      const release = () => {
        clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(reset, 500);
      };
      button.addEventListener('mouseenter', activate);
      button.addEventListener('mouseleave', reset);
      button.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') activate();
      });
      button.addEventListener('pointerleave', event => {
        if (event.pointerType !== 'touch') reset();
      });
      button.addEventListener('pointerdown', activate, {passive: true});
      button.addEventListener('pointerup', release, {passive: true});
      button.addEventListener('pointercancel', release, {passive: true});
      button.addEventListener('touchstart', activate, {passive: true});
      button.addEventListener('touchend', release, {passive: true});
      button.addEventListener('touchcancel', release, {passive: true});
    });
    document.querySelectorAll('.link-arrow').forEach(arrow => {
      const button = arrow.closest('a, button');
      if (!button) return;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      arrow.style.setProperty('transition', reducedMotion ? 'none' : 'transform 280ms ease', 'important');
      const show = () => arrow.style.setProperty('transform', 'translate(2px, -2px) rotate(-45deg)', 'important');
      const reset = () => arrow.style.setProperty('transform', 'translate(0, 0) rotate(0deg)', 'important');
      button.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') show();
      });
      button.addEventListener('mouseenter', show);
      button.addEventListener('focus', show);
      button.addEventListener('pointerdown', event => {
        if (event.pointerType === 'touch') arrow.style.setProperty('transition', 'none', 'important');
        show();
      });
      button.addEventListener('pointerleave', reset);
      button.addEventListener('mouseleave', reset);
      button.addEventListener('blur', reset);
      button.addEventListener('pointercancel', reset);
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeArrowButtons, { once: true });
  } else {
    initializeArrowButtons();
  }
})();

(function () {
  const menu = document.querySelector('header .menu');
  const navigation = document.getElementById('primary-nav');
  if (menu && navigation) {
    const setMenuOpen = (open) => {
      navigation.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    };
    menu.addEventListener('click', () => setMenuOpen(menu.getAttribute('aria-expanded') !== 'true'));
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        menu.focus();
      }
    });
  }

  document.querySelectorAll('form[data-contact-form]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const status = form.querySelector('.form-status');
      const button = form.querySelector('button[type="submit"]');
      const originalLabel = button ? button.textContent : '';
      if (button) {
        button.disabled = true;
        button.textContent = 'Anfrage wird gesendet …';
      }
      if (status) {
        status.classList.remove('is-success', 'is-error');
        status.textContent = 'Ihre Anfrage wird übermittelt …';
      }
      form.setAttribute('aria-busy', 'true');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.ok !== true) {
          throw new Error(result.message || 'Die Anfrage konnte nicht gesendet werden.');
        }
        form.reset();
        if (status) {
          status.classList.add('is-success');
          status.textContent = 'Vielen Dank. Ihre Anfrage wurde gesendet. Wir melden uns persönlich bei Ihnen.';
        }
      } catch (error) {
        if (status) {
          status.classList.add('is-error');
          status.innerHTML = 'Die Anfrage konnte gerade nicht übermittelt werden. Bitte schreiben Sie direkt an <a href="mailto:info@elbhaus-projekt.de">info@elbhaus-projekt.de</a>.';
        }
      } finally {
        form.removeAttribute('aria-busy');
        if (button) {
          button.disabled = false;
          button.textContent = originalLabel;
        }
      }
    });
  });

  const valueSection = document.querySelector('.value-development');
  if (valueSection) {
    const amounts = Array.from(valueSection.querySelectorAll('[data-count-euro]'));
    const formatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
    const values = amounts.map(element => {
      const original = element.textContent.trim();
      return {
        element,
        target: Number(original.replace(/\D/g, '')),
        prefix: original.startsWith('+') ? '+' : '',
      };
    });
    const render = (item, value) => {
      item.element.textContent = `${item.prefix}${formatter.format(Math.round(value))} €`;
    };
    values.forEach(item => render(item, 0));

    let hasRun = false;
    const runCounters = () => {
      if (hasRun) return;
      hasRun = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        values.forEach(item => render(item, item.target));
        return;
      }
      const duration = 2400;
      const start = performance.now();
      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        values.forEach(item => render(item, item.target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runCounters();
            observer.disconnect();
          }
        });
      }, { threshold: 0.22 });
      observer.observe(valueSection);
    } else {
      runCounters();
    }
  }

  const touchGraphics = document.querySelectorAll('.typical-situations .situation, .value-case, .infill-case');
  touchGraphics.forEach(graphic => {
    let releaseTimer;
    const activate = event => {
      if (event.pointerType !== 'touch') return;
      window.clearTimeout(releaseTimer);
      touchGraphics.forEach(item => {
        if (item !== graphic) item.classList.remove('is-touch-active');
      });
      graphic.classList.add('is-touch-active');
    };
    const release = event => {
      if (event.pointerType !== 'touch') return;
      releaseTimer = window.setTimeout(() => graphic.classList.remove('is-touch-active'), 700);
    };
    graphic.addEventListener('pointerdown', activate, { passive: true });
    graphic.addEventListener('pointerup', release, { passive: true });
    graphic.addEventListener('pointercancel', release, { passive: true });
  });

})();

// Interaktiver Potenzialfinder auf der Startseite.
(function () {
  const root = document.getElementById('elbhaus-potential-finder');
  if (!root) return;

  const content = root.querySelector('[data-finder-content]');
  const question = root.querySelector('.potential-finder-question');
  const stepLabel = root.querySelector('[data-finder-step]');
  const headBack = root.querySelector('[data-finder-head-back]');
  const progress = root.querySelector('[data-finder-progress]');
  const state = { step: 1, type: null, situation: null };

  const types = [
    ['efh', 'Einfamilienhaus', 'Haus mit eigenem Grundstück'],
    ['mfh', 'Mehrfamilienhaus', 'Gebäude mit mehreren Wohnungen'],
    ['land', 'Unbebautes Grundstück', 'Baulücke oder freie Fläche'],
    ['other', 'Sonstige Immobilie', 'Besondere oder gemischte Nutzung'],
  ];

  const situations = {
    efh: [
      ['garden', 'Großer Garten oder großes Grundstück', 'Freie Fläche hinter oder neben dem Haus'],
      ['attic', 'Unausgebautes Dachgeschoss', 'Dachraum könnte zusätzliche Fläche bieten'],
      ['old', 'Kleiner oder älterer Bestand', 'Bessere Grundstücksausnutzung denkbar'],
      ['sell', 'Verkauf wird erwogen', 'Potenzial vor der Vermarktung klären'],
    ],
    mfh: [
      ['attic', 'Ungenutztes Dachgeschoss', 'Dachraum könnte ausgebaut werden'],
      ['flat', 'Flachdach oder niedriger Gebäudeteil', 'Aufstockung könnte möglich sein'],
      ['yard', 'Großer Hof oder freie Fläche', 'Zusätzlicher Baukörper denkbar'],
      ['sell', 'Verkauf wird erwogen', 'Potenzial vor der Vermarktung klären'],
    ],
    land: [
      ['gap', 'Baulücke', 'Freie Fläche zwischen bestehender Bebauung'],
      ['rear', 'Rückwärtiges Grundstück', 'Bauplatz im hinteren Bereich denkbar'],
      ['unclear', 'Baurecht unklar', 'Planungsrecht zuerst belastbar prüfen'],
      ['sell', 'Verkauf wird erwogen', 'Potenzial vor der Vermarktung klären'],
    ],
    garage: [
      ['garages', 'Garagenhof', 'Neuordnung oder andere Bebauung prüfen'],
      ['parking', 'Größere Stellplatzfläche', 'Fläche könnte mehrfach genutzt werden'],
      ['outbuildings', 'Nebengebäude oder Lagerfläche', 'Bestand neu ordnen oder ersetzen'],
      ['sell', 'Verkauf wird erwogen', 'Potenzial vor der Vermarktung klären'],
    ],
    other: [
      ['garages', 'Stellplatz- und Garagenflächen', 'Flächen neu ordnen oder entwickeln'],
      ['unclearPotential', 'Potenzial noch unklar', 'Erste Einordnung möglicher Potenziale'],
      ['change', 'Nutzung soll geändert werden', 'Alternative Nutzungsmöglichkeiten prüfen'],
      ['sell', 'Verkauf wird erwogen', 'Potenzial vor der Vermarktung klären'],
    ],
  };

  const ideas = {
    garden: [
      ['Grundstücksteilung', 'Prüfung, ob eine Teilfläche als eigenständiger Bauplatz entwickelt werden kann.', 'garden'],
      ['Hinterlandbebauung', 'Untersuchung eines zusätzlichen Wohngebäudes im rückwärtigen Grundstücksbereich.', 'rear'],
    ],
    attic: [['Dachgeschossausbau', 'Prüfung zusätzlicher Wohnfläche oder neuer Wohneinheiten im Dachraum.', 'attic']],
    old: [
      ['Anbau oder Erweiterung', 'Zusätzliche Nutzfläche am bestehenden Gebäude untersuchen.', 'change'],
      ['Ersatzneubau', 'Prüfen, ob ein Neubau eine sinnvollere Flächennutzung ermöglichen kann.', 'old'],
    ],
    sell: [
      ['Baurecht vor dem Verkauf klären', 'Mögliche Bebauung konkretisieren und als Mehrwert im Verkauf sichtbar machen.', 'sell'],
      ['Entwicklungsstrategie vorbereiten', 'Entwicklungs- und Verkaufswege wirtschaftlich miteinander vergleichen.', 'unclear'],
    ],
    flat: [['Aufstockung', 'Prüfung eines zusätzlichen Geschosses oder einer zurückgesetzten Ergänzung.', 'flat']],
    yard: [['Innenhofbebauung', 'Zusätzliche Bebauung auf freien Hof- oder Grundstücksflächen untersuchen.', 'yard']],
    gap: [['Baulückenbebauung', 'Mögliche Baukörper und Nutzungen für die freie Fläche entwickeln.', 'gap']],
    rear: [['Hinterlandbebauung', 'Eigenständigen Bauplatz im rückwärtigen Bereich des Grundstücks prüfen.', 'rear']],
    unclear: [['Baurechtsprüfung', 'Planungsrechtliche Rahmenbedingungen und realistische Bebauungsoptionen klären.', 'unclear']],
    unclearPotential: [['Potenzialprüfung', 'Mögliche Entwicklungsansätze für die Immobilie systematisch untersuchen.', 'unclear']],
    change: [['Nutzungsänderung', 'Neue Nutzungskonzepte und die dafür erforderlichen Genehmigungen prüfen.', 'change']],
    garages: [
      ['Garagenhofentwicklung', 'Alternative Bebauung unter Berücksichtigung des Stellplatzbedarfs untersuchen.', 'garages'],
      ['Stellplatzfläche entwickeln', 'Zusätzliche Nutzung bei einer möglichen Neuordnung der Stellplätze prüfen.', 'parking'],
    ],
    parking: [['Stellplatzfläche entwickeln', 'Zusätzliche Nutzung bei einer möglichen Neuordnung der Stellplätze prüfen.', 'parking']],
    outbuildings: [['Nebengebäude neu ordnen', 'Ersatz, Umbau oder alternative Nutzung der Fläche untersuchen.', 'outbuildings']],
  };

  const diagramBodies = {
    efhBase: '<path d="M40 106V51L90 18L140 51V106 M40 51H140 M81 106V78H99V106 M54 64H69V79H54Z M111 64H126V79H111Z M31 106H149"/>',
    mfhBase: '<path d="M35 20H145V105H35Z M27 105H153 M51 36H66V51H51Z M83 36H98V51H83Z M114 36H129V51H114Z M51 62H66V77H51Z M83 62H98V77H83Z M114 62H129V77H114Z M78 105V84H102V105"/>',
    landBase: '<path d="M15 100H165 M53 100V70 M127 100V62"/><path d="M53 70C37 70 35 50 47 45C44 31 63 24 70 37C82 34 88 50 79 58C81 67 68 74 61 68C59 70 56 70 53 70Z M127 62C113 62 110 45 120 40C117 27 135 21 142 33C153 30 160 45 151 53C153 61 140 68 134 61C132 62 129 62 127 62Z"/>',
    garageBase: '<path d="M18 101H162 M27 59H73V101H27Z M81 59H127V101H81Z M35 70H65V101 M89 70H119V101 M137 76H158L164 88V101H132V88Z M139 88H160 M139 101a6 6 0 0 0 12 0 M150 101a6 6 0 0 0 12 0"/>',
    otherBase: '<path d="M15 102H165 M22 43H84V102H22Z M36 58H50V72H36Z M57 58H71V72H57Z M42 102V81H64V102 M98 27H154V102H98Z M111 43H123V57H111Z M132 43H144V57H132Z M111 68H123V82H111Z M132 68H144V82H132Z"/>',
    unclearChoice: '<rect x="9" y="11" width="162" height="98"/><text class="finder-symbol" x="90" y="76" text-anchor="middle" fill="currentColor" stroke="none" font-family="Montserrat, Arial, sans-serif" font-size="45" font-weight="200">§</text>',
    unclearPotentialChoice: '<rect x="9" y="11" width="162" height="98"/><circle cx="84" cy="54" r="14"/><path d="M94 64L108 78"/>',
    sellChoice: '<rect x="9" y="11" width="162" height="98"/><text class="finder-symbol" x="90" y="76" text-anchor="middle" fill="currentColor" stroke="none" font-family="Montserrat, Arial, sans-serif" font-size="45" font-weight="200">€</text>',
    efh: '<path d="M9 11H171V109H9Z M20 69V43L47 24L74 43V69Z M20 43H74 M37 69V51H56V69 M16 76H79"/><path class="finder-potential" d="M105 34H157V82H105Z"/>',
    mfh: '<path d="M35 42H145V108H35Z M30 112H150 M51 57H65V71H51Z M83 57H97V71H83Z M115 57H129V71H115Z M51 82H65V96H51Z M115 82H129V96H115Z M82 108V83H98V108"/><path class="finder-potential" d="M35 42V23L90 11L145 23V42Z"/>',
    land: '<path d="M9 11H171V109H9Z M21 96H159 M29 20V100"/><path class="finder-potential" d="M78 31H141V78H78Z M91 44H106V59H91Z M116 44H131V59H116Z"/>',
    garage: '<path d="M9 11H171V109H9Z M20 64H47V91H20Z M55 64H82V91H55Z M90 64H117V91H90Z M26 72H41 M61 72H76 M96 72H111"/><path class="finder-potential" d="M61 24H152V56H61Z"/>',
    other: '<path d="M15 97H165 M23 45H85V97H23Z M38 60H51V74H38Z M58 60H71V74H58Z"/><path class="finder-potential" d="M85 60H153V97H85Z M101 71H116V84H101Z M126 71H141V84H126Z"/>',
    garden: '<path d="M9 11H171V109H9Z M20 76V43L47 25L74 43V76Z M16 76H80"/><path class="finder-potential" d="M111 27H157V68H111Z M9 84H171"/>',
    rear: '<path d="M9 11H171V109H9Z M20 71H70V97H20Z"/><path d="M81 88H150 M92 84l8 4-8 4"/><path class="finder-potential" d="M112 24H158V58H112Z"/>',
    attic: '<path d="M29 50H151V108H29Z M24 108H156 M47 66H62V81H47Z M82.5 66H97.5V81H82.5Z M118 66H133V81H118Z"/><path class="finder-potential" d="M29 50L90 14L151 50Z M76 36V23H104V36"/>',
    old: '<path d="M10 105H170 M22 58H75V105H22Z M34 72H48V86H34Z"/><path class="finder-potential" d="M98 24H158V105H98Z M111 39H126V54H111Z M135 39H150V54H135Z"/>',
    sell: '<path d="M9 11H171V109H9Z M22 69H76V97H22Z"/><path class="finder-potential" d="M105 29H158V71H105Z M15 82H165"/><path d="M138 17l7 7 14-16"/>',
    flat: '<path d="M22 50H158V108H22Z M17 108H163 M42 66H57V81H42Z M82.5 66H97.5V81H82.5Z M123 66H138V81H123Z"/><path class="finder-potential" d="M46 21H134V50H46Z"/>',
    yard: '<path d="M9 11H171V109H9Z M19 23H161V40H19Z M19 40H37V97H19Z M143 40H161V97H143Z"/><path class="finder-potential" d="M68 60H112V86H68Z"/>',
    gap: '<path d="M10 106H170 M17 41H62V106H17Z M119 27H164V106H119Z"/><path class="finder-potential" d="M68 54H113V106H68Z"/>',
    unclear: '<path d="M9 11H171V109H9Z M21 73H75V97H21Z"/><path class="finder-potential" d="M102 29H157V73H102Z M9 82H171"/><path d="M127 45v12 M127 65v1"/>',
    change: '<path d="M16 18H164V103H16Z M16 58H164 M70 18V58 M118 58V103"/><path class="finder-potential" d="M70 58H118V103H70Z M36 38H52 M88 38H104"/>',
    garages: '<path d="M9 11H171V109H9Z M18 70H49V97H18Z M56 70H87V97H56Z M94 70H125V97H94Z"/><path class="finder-potential" d="M45 24H151V61H45Z"/>',
    parking: '<path d="M9 11H171V109H9Z M18 72H158 M40 72V101 M72 72V101 M104 72V101 M136 72V101"/><path class="finder-potential" d="M47 23H144V61H47Z"/>',
    outbuildings: '<path d="M9 11H171V109H9Z M20 57H72V97H20Z"/><path class="finder-potential" d="M97 35H157V97H97Z"/>',
  };

  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const diagram = key => `<div class="potential-finder-diagram" aria-hidden="true"><svg viewBox="0 0 180 120"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">${diagramBodies[key] || diagramBodies.unclear}</g></svg></div>`;
  const situationDiagram = key => diagram(key === 'unclear' ? 'unclearChoice' : key === 'unclearPotential' ? 'unclearPotentialChoice' : key === 'sell' ? 'sellChoice' : key);
  const selectedType = () => types.find(type => type[0] === state.type);
  const selectedSituation = () => (situations[state.type] || []).find(item => item[0] === state.situation);

  function setProgress() {
    stepLabel.textContent = `Schritt ${state.step} von 3`;
    headBack.hidden = state.step === 1;
    progress.setAttribute('aria-label', `Fortschritt: Schritt ${state.step} von 3`);
    progress.querySelectorAll('span').forEach((bar, index) => bar.classList.toggle('is-active', index < state.step));
  }

  function bindTouchStates() {
    content.querySelectorAll('.potential-finder-option, .potential-finder-result').forEach(element => {
      let releaseTimer;
      const setGraphicActive = active => {
        element.classList.toggle('is-hover-active', active);
        element.querySelectorAll('.finder-potential').forEach(shape => {
          shape.style.fill = active ? 'rgba(18,51,75,.24)' : '';
          shape.style.strokeWidth = active ? '2.4' : '';
          shape.style.strokeDasharray = active ? 'none' : '';
          shape.style.filter = active ? 'drop-shadow(0 3px 3px rgba(18,51,75,.18))' : '';
        });
        element.querySelectorAll('.finder-symbol').forEach(symbol => {
          symbol.style.fontWeight = active ? '400' : '';
          symbol.style.stroke = '';
          symbol.style.strokeWidth = '';
          symbol.style.paintOrder = '';
        });
      };
      element.addEventListener('mouseenter', () => setGraphicActive(true));
      element.addEventListener('mouseleave', () => setGraphicActive(false));
      element.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'touch') return;
        window.clearTimeout(releaseTimer);
        element.classList.add('is-touch-active');
        setGraphicActive(true);
      }, { passive: true });
      const release = event => {
        if (event.pointerType !== 'touch') return;
        releaseTimer = window.setTimeout(() => {
          element.classList.remove('is-touch-active');
          setGraphicActive(false);
        }, 650);
      };
      element.addEventListener('pointerup', release, { passive: true });
      element.addEventListener('pointercancel', release, { passive: true });
    });
  }

  function goBack() {
    state.step = Math.max(1, state.step - 1);
    if (state.step === 1) state.situation = null;
    render();
  }

  function render() {
    setProgress();
    if (state.step === 1) {
      question.textContent = 'Immobilientyp auswählen.';
      content.innerHTML = `<div class="potential-finder-options potential-finder-types">${types.map(type => `<button type="button" class="potential-finder-option" data-finder-type="${type[0]}">${diagram(`${type[0]}Base`)}<strong>${escapeHtml(type[1])}</strong></button>`).join('')}</div>`;
      content.querySelectorAll('[data-finder-type]').forEach(button => button.addEventListener('click', () => {
        state.type = button.dataset.finderType;
        state.step = 2;
        render();
      }));
    } else if (state.step === 2) {
      question.textContent = 'Ausgangssituation auswählen.';
      const options = situations[state.type] || situations.other;
      content.innerHTML = `<div class="potential-finder-options potential-finder-situations">${options.map(item => `<button type="button" class="potential-finder-option" data-finder-situation="${item[0]}">${situationDiagram(item[0])}<strong>${escapeHtml(item[1])}</strong></button>`).join('')}</div>`;
      content.querySelectorAll('[data-finder-situation]').forEach(button => button.addEventListener('click', () => {
        state.situation = button.dataset.finderSituation;
        state.step = 3;
        render();
      }));
    } else {
      question.textContent = 'Mögliche Entwicklungspotenziale.';
      const type = selectedType();
      const situation = selectedSituation();
      const results = ideas[state.situation] || ideas.unclear;
      const inquiryText = `Anfrage über den Elbhaus-Potenzialfinder\nImmobilientyp: ${type[1]}\nAusgangssituation: ${situation[1]}\nMögliche Entwicklungsansätze: ${results.map(result => result[0]).join(', ')}`;
      content.innerHTML = `<div class="potential-finder-final"><div class="potential-finder-final-results"><div class="potential-finder-results${results.length === 1 ? ' is-single' : ''}">${results.map(result => `<article class="potential-finder-result">${diagram(result[2])}<div><h3>${escapeHtml(result[0])}</h3><p>${escapeHtml(result[1])}</p></div></article>`).join('')}</div><p class="potential-finder-notice">Unverbindliche Orientierung – objektspezifische Prüfung erforderlich.</p></div><form class="potential-finder-form" action="/contact.php" method="post" aria-label="Kontaktanfrage zum ermittelten Entwicklungspotenzial"><div class="potential-finder-form-title">Objekt prüfen lassen</div><div class="form-honeypot" aria-hidden="true"><label for="finder-contact-website">Website</label><input id="finder-contact-website" name="website" tabindex="-1" autocomplete="off"></div><div class="form-field"><label for="finder-contact-name">Name <span aria-hidden="true">*</span></label><input id="finder-contact-name" name="name" autocomplete="name" maxlength="160" required></div><div class="form-field"><label for="finder-contact-email">E-Mail <span aria-hidden="true">*</span></label><input id="finder-contact-email" name="email" type="email" autocomplete="email" maxlength="254" required></div><div class="form-field"><label for="finder-contact-phone">Telefon <span aria-hidden="true">*</span></label><input id="finder-contact-phone" name="telefon" type="tel" autocomplete="tel" maxlength="80" required></div><div class="form-field"><label for="finder-contact-address">Objektadresse <span aria-hidden="true">*</span></label><input id="finder-contact-address" name="objektadresse" autocomplete="street-address" placeholder="Straße, Hausnummer, Ort" maxlength="300" required></div><input type="hidden" name="nachricht" value="${escapeHtml(inquiryText)}"><label class="potential-finder-consent"><input name="datenschutz" type="checkbox" required><span>Ich habe die <a href="/datenschutz/">Datenschutzerklärung</a> zur Kenntnis genommen. *</span></label><button class="submit potential-finder-submit" type="submit">Anfrage senden</button><p class="potential-finder-form-note">* Pflichtfelder</p><p class="form-status" role="status" aria-live="polite"></p></form></div>`;
      const form = content.querySelector('.potential-finder-form');
      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const status = form.querySelector('.form-status');
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Anfrage wird gesendet …';
        status.classList.remove('is-success', 'is-error');
        status.textContent = 'Ihre Anfrage wird übermittelt …';
        form.setAttribute('aria-busy', 'true');
        try {
          const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok || result.ok !== true) throw new Error(result.message || 'Versand fehlgeschlagen');
          form.reset();
          status.classList.add('is-success');
          status.textContent = 'Vielen Dank. Ihre Anfrage wurde gesendet. Wir melden uns persönlich bei Ihnen.';
        } catch (error) {
          status.classList.add('is-error');
          status.innerHTML = 'Die Anfrage konnte gerade nicht übermittelt werden. Bitte schreiben Sie direkt an <a href="mailto:info@elbhaus-projekt.de">info@elbhaus-projekt.de</a>.';
        } finally {
          form.removeAttribute('aria-busy');
          button.disabled = false;
          button.textContent = 'Anfrage senden';
        }
      });
    }
    bindTouchStates();
  }

  headBack.addEventListener('click', goBack);
  render();
})();


// Kompakte Sticky-Navigation nach dem ersten Scrollbereich
(function () {
  const header = document.querySelector('header');
  if (!header) return;
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 28);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();


// Kurzer Marken-Auftakt: zuerst nur das Elbhaus-Logo, danach Navigation und Seiteninhalt.
// Die Verzögerung ist bewusst sehr kurz, damit die Seite nicht langsam wirkt.
(function(){
  const body=document.body;
  if(!body || !body.classList.contains('page-intro')) return;
  window.setTimeout(function(){
    body.classList.add('intro-reveal');
  }, 180);
})();


// Startseite: Skizze baut sich erst auf, wenn sie beim Scrollen sichtbar wird.
(function(){
  const sketches=document.querySelectorAll('[data-sketch-build]');
  if(!sketches.length) return;

  if(!('IntersectionObserver' in window)){
    sketches.forEach(el=>el.classList.add('is-drawing'));
    return;
  }

  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-drawing');
        obs.unobserve(entry.target);
      }
    });
  },{threshold:.28});

  sketches.forEach(el=>observer.observe(el));
})();


// Freigestellte Aufstockungsskizze: erst beim Sichtbarwerden Linie für Linie aufbauen.
(function(){
 const el=document.querySelector('[data-line-sketch]');
 if(!el) return;
 const draw=()=>{
   if(el.classList.contains('is-drawing')) return;
   el.classList.add('is-drawing');
   window.setTimeout(()=>el.classList.add('is-complete'),3250);
 };
 if(!('IntersectionObserver' in window)){draw();return;}
 const io=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
     if(entry.isIntersecting){draw();io.disconnect();}
   });
 },{threshold:.25});
 io.observe(el);
})();

// Echte SVG-Pfadanimation: startet einmal, sobald die Skizze ins Sichtfeld kommt.
(function(){
 const el=document.querySelector('[data-svg-sketch]');
 if(!el)return;
 const start=()=>el.classList.add('is-drawing');
 if(!('IntersectionObserver' in window)){start();return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){start();io.disconnect()}}),{threshold:.28});
 io.observe(el);
})();

// Originalgetreuer Linienaufbau der freigegebenen Aufstockungsskizze.
(function(){
 const box=document.querySelector('[data-approved-sketch]');
 if(!box)return;
 box.querySelectorAll('.approved-lines path').forEach((p,i)=>p.style.setProperty('--path-index',i));
 const start=()=>box.classList.add('is-drawing');
 if(!('IntersectionObserver' in window)){start();return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){start();io.disconnect()}}),{threshold:.24});
 io.observe(box);
})();

// Zeichnet die aus der freigegebenen Originalskizze erkannten Linien erst beim Scrollen.
(function(){
 const el=document.querySelector('[data-exact-sketch]');
 if(!el)return;
 const start=()=>el.classList.add('is-drawing');
 if(!('IntersectionObserver' in window)){start();return}
 const io=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting){start();io.disconnect();}});
 },{threshold:.24});
 io.observe(el);
})();

// Die nachgezeichnete Originalgeometrie entsteht erst beim Erreichen des Bereichs.
(function(){
 const el=document.querySelector('[data-traced-sketch]');
 if(!el)return;
 const start=()=>el.classList.add('is-drawing');
 if(!('IntersectionObserver' in window)){start();return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){start();io.disconnect()}}),{threshold:.22});
 io.observe(el);
})();


// Freigestellte Aufstockungsskizze beim Herunterscrollen langsam einblenden.
(function(){
  const el=document.querySelector('[data-sketch-fade]');
  if(!el)return;
  const show=()=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){show();return;}
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){show();io.disconnect();}
    });
  },{threshold:.25});
  io.observe(el);
})();


// Machbarkeitsstudien-Skizze analog zur Aufstockungsskizze langsam einblenden.
(function(){
  const el=document.querySelector('[data-study-sketch-fade]');
  if(!el)return;
  const show=()=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){show();return}
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){show();io.disconnect()}});
  },{threshold:.25});
  io.observe(el);
})();

(function(){
 const el=document.querySelector('[data-infill-sketch-fade]'); if(!el)return;
 const show=()=>el.classList.add('is-visible');
 if(!('IntersectionObserver' in window)){show();return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){show();io.disconnect()}}),{threshold:.25});
 io.observe(el);
})();

/* Leistungsumfang: Scroll-Reveal */
(function(){
  const lists=document.querySelectorAll('.scope-scroll-reveal');
  if(!lists.length)return;
  if(!('IntersectionObserver' in window)){
    lists.forEach(el=>el.classList.add('is-visible'));
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  lists.forEach(el=>io.observe(el));
})();

/* Prozessschritte 01–04 beim Erreichen des Bereichs zügig nacheinander einblenden. */
(function(){
  const groups=document.querySelectorAll('.process-steps');
  if(!groups.length)return;
  const show=el=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){
    groups.forEach(show);
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  },{threshold:.28,rootMargin:'0px 0px -8% 0px'});
  groups.forEach(el=>io.observe(el));
})();

/* Die drei Leistungssymbole und die drei Entwicklungsgrafiken gruppenweise gleichzeitig einblenden. */
(function(){
  const groups=document.querySelectorAll('.service-areas .cards, .typical-situations .situations-grid');
  if(!groups.length)return;
  const show=el=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){
    groups.forEach(show);
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  },{threshold:.2,rootMargin:'0px 0px -8% 0px'});
  groups.forEach(el=>io.observe(el));
})();

/* Zweispaltige Startseitenbereiche und ausschließlich das Kontaktformular seitlich einfliegen lassen. */
(function(){
  const sections=document.querySelectorAll('.scroll-split-reveal, .contact-form-reveal');
  if(!sections.length)return;
  const show=el=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){
    sections.forEach(show);
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  },{threshold:.16,rootMargin:'0px 0px -8% 0px'});
  sections.forEach(el=>io.observe(el));
})();

/* Einzelne Textblöcke auf den Unterseiten erst beim eigenen Eintritt in den Viewport einfliegen lassen. */
(function(){
  const blocks=document.querySelectorAll('.scroll-fly-left, .scroll-fly-right');
  if(!blocks.length)return;
  const show=el=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){
    blocks.forEach(show);
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  },{threshold:.13,rootMargin:'0px 0px -7% 0px'});
  blocks.forEach(el=>io.observe(el));
})();
