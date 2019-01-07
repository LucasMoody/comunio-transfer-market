function positionTranslator(position) {
  switch (position) {
    case 'keeper':
      return 'Tor';
    case 'defender':
      return 'Abwehr';
    case 'midfielder':
      return 'Mittelfeld';
    case 'striker':
      return 'Sturm';
  }
}

function clubIdToName(clubId) {
  const clubs = {
    1: 'FC Bayern München',
    12: 'VFL Wolfsburg',
    3: 'Borussia M\'Gladbach',
    8: 'Bayer 04 Leverkusen',
    68: 'FC Augsburg',
    10: 'FC Schalke 04',
    5: 'Borussia Dortmund',
    62: '1899 Hoffenheim',
    9: 'Eintracht Frankfurt',
    6: 'SV Werder Bremen',
    18: '1. FSV Mainz 05',
    13: '1. FC Köln',
    14: 'VFB Stuttgart',
    17: 'Hannover 96',
    7: 'Hertha BSC Berlin',
    4: 'Hamburger SV',
    90: 'FC Ingolstadt 04',
    89: 'SV Darmstadt 98',
    92: 'RB Leipzig',
    21: 'SC Freibug',
  };
  return clubs[clubId]
}

module.exports = {
  positionTranslator,
  clubIdToName
};
