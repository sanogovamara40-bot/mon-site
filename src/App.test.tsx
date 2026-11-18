import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

function stubBrowser(search: string): void {
  vi.stubGlobal('window', {
    location: { search, pathname: '/', href: `https://unanime.app/${search}` },
  })
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
  })
}

async function renderApp(search: string): Promise<string> {
  stubBrowser(search)
  // `boot` is computed at module load, so each scenario needs a fresh module.
  vi.resetModules()
  const { default: App } = await import('./App')
  return renderToStaticMarkup(<App />)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('juge la disponibilité sur toute la durée de la réunion', async () => {
    const html = await renderApp('?z=Europe/Paris,Europe/Berlin&s=9&e=10&dur=90&d=2026-11-13')

    expect(html).toContain('0/2 dans les horaires')
    expect(html).not.toContain('Tout le monde est disponible')
  })

  it('affiche les minutes du créneau le moins contraignant', async () => {
    const html = await renderApp('?z=Australia/Lord_Howe,America/New_York&d=2026-04-05')

    expect(html).toContain('Le moins contraignant : 8h30')
    expect(html).not.toContain('Le moins contraignant : 8h<')
  })

  it('ne présente pas comme disponible une suggestion trop courte pour la durée', async () => {
    const html = await renderApp('?z=Europe/Paris,Asia/Tokyo&s=9&e=18&dur=90&d=2026-11-13')

    expect(html).toContain('1/2 dispo')
    expect(html).not.toContain('>tout le monde<')
  })

  it('affiche la vraie durée du recouvrement pour 30 et 90 minutes', async () => {
    const short = await renderApp('?z=Europe/Paris&s=9&e=18&dur=30&d=2026-11-13')
    expect(short).toContain('9h – 9h30')
    expect(short).toContain('30 min de recouvrement')

    const long = await renderApp('?z=Europe/Paris&s=9&e=11&dur=90&d=2026-11-13')
    expect(long).toContain('9h – 10h30')
    expect(long).toContain('1 h 30 de recouvrement')
  })

  it('adapte la grille aux journées de 22 et 26 heures', async () => {
    const html = await renderApp('?z=Antarctica/Troll&d=2026-10-25')

    expect(html).toContain('--columns:26')
  })

  it('ne plante pas sur une date absente du fuseau choisi', async () => {
    const html = await renderApp('?z=Pacific/Apia&d=2011-12-30')

    expect(html).toContain('existe pas dans le fuseau')
  })
})
