import { parseFrequency } from './frequency.ts';

const CSV = `count,spanish,pos,flags,usage
24459038,de,prep,,24459038:de
20081793,ella,pron,,15403031:la|3687944:las|911291:ella|79527:ellas
3120,comer,v,,1900:comer|600:como|400:come|220:comer
812,Madrid,prop,,812:Madrid
90,xyz,none,NOUSAGE,
`;

describe('parseFrequency', () => {
  const rows = parseFrequency(CSV);

  test('reads every data row in file order, skipping the header', () => {
    expect(rows.map((row) => row.lemma)).toEqual(['de', 'ella', 'comer', 'Madrid', 'xyz']);
  });

  test('reads POS and count', () => {
    expect(rows[2]).toEqual(expect.objectContaining({ lemma: 'comer', pos: 'v', count: 3120 }));
  });

  test('takes forms from the usage column, de-duplicated, without the lemma itself', () => {
    expect(rows[1].forms).toEqual(['la', 'las', 'ellas']);
    expect(rows[2].forms).toEqual(['como', 'come']);
  });

  test('handles rows without usage', () => {
    expect(rows[4].forms).toEqual([]);
  });

  test('fails on a malformed row instead of skipping it', () => {
    expect(() => parseFrequency('count,spanish,pos,flags,usage\nnot-a-number,de,prep,,\n')).toThrow(
      /line 2/,
    );
  });
});
