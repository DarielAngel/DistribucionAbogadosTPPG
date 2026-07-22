"""
Import Excel schedule into SQLite.
Usage: python3 import_excel.py [path/to/excel.xls] [path/to/database.sqlite]
Defaults to repo-relative paths.
"""
import sys, os, sqlite3, xlrd
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_XLS = os.path.join(SCRIPT_DIR, '../../../../sabana de abogados. 15 DE JUNIO.xls')
DEFAULT_DB  = os.path.join(SCRIPT_DIR, '../../..', 'database.sqlite')

XLS_PATH = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLS
DB_PATH  = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_DB

YEAR = 2026  # year the schedule belongs to

MONTH_MAP = {
    'enero':1,'febrero':2,'marzo':3,'abril':4,'mayo':5,'junio':6,
    'julio':7,'agosto':8,'septiembre':9,'octubre':10,'noviembre':11,'diciembre':12,
}

RED_COLOR_INDEX = 10  # xlrd index for RGB(255,0,0) in this workbook

NOW = datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def parse_workbook(xls_path):
    wb = xlrd.open_workbook(xls_path, formatting_info=True)
    xf_list = wb.xf_list
    lawyers = {}   # name -> id (assigned later)
    tasks   = []   # list of dicts

    for si in range(wb.nsheets):
        ws = wb.sheet_by_index(si)
        month = MONTH_MAP.get(ws.name.strip().lower())
        if month is None:
            continue

        # row 2: day numbers in columns 1+
        days = {}
        for c in range(1, ws.ncols):
            v = ws.cell(2, c).value
            if isinstance(v, float) and v > 0:
                days[c] = int(v)

        for r in range(3, ws.nrows):
            name = ws.cell(r, 0).value
            if not isinstance(name, str):
                continue
            name = name.strip()
            if not name:
                continue
            lawyers[name] = None  # id TBD

            for c, day in days.items():
                cell = ws.cell(r, c)
                val  = cell.value
                if not isinstance(val, str):
                    continue
                val = val.strip()
                if not val:
                    continue
                xf      = xf_list[cell.xf_index]
                is_red  = xf.background.pattern_colour_index == RED_COLOR_INDEX
                tasks.append({
                    'lawyer': name,
                    'date': f'{YEAR:04d}-{month:02d}-{day:02d}',
                    'description': val,
                    'affected': is_red,
                })

    return lawyers, tasks


def main():
    print(f'Reading  {XLS_PATH}')
    print(f'Writing  {DB_PATH}')

    lawyers_dict, tasks = parse_workbook(XLS_PATH)

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    # Clean lawyers and schedules (keep Users and Settings)
    cur.execute('DELETE FROM Schedules')
    cur.execute('DELETE FROM Lawyers')
    cur.execute("DELETE FROM sqlite_sequence WHERE name IN ('Lawyers','Schedules')")
    con.commit()
    print('DB cleaned (Lawyers + Schedules)')

    # Insert lawyers
    for name in sorted(lawyers_dict):
        cur.execute(
            'INSERT INTO Lawyers (name, createdAt, updatedAt) VALUES (?, ?, ?)',
            (name, NOW, NOW)
        )
        lawyers_dict[name] = cur.lastrowid

    con.commit()
    print(f'Inserted {len(lawyers_dict)} lawyers')

    # Insert schedules
    rows = []
    for t in tasks:
        lid = lawyers_dict.get(t['lawyer'])
        if lid is None:
            continue
        rows.append((
            'task',
            t['date'],
            t['description'],
            'afectado' if t['affected'] else None,
            lid,
            NOW, NOW,
        ))

    cur.executemany(
        'INSERT INTO Schedules (type, date, description, category, lawyerId, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?)',
        rows
    )
    con.commit()

    affected = sum(1 for r in rows if r[3] == 'afectado')
    print(f'Inserted {len(rows)} schedules ({affected} afectadas)')

    con.close()
    print('Done.')


if __name__ == '__main__':
    main()
