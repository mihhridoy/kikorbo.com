import type { Lang, Dict, AreaDict } from './types';
import { common } from './dicts/common';
import { experts } from './dicts/experts';
import { user } from './dicts/user';
import { expert } from './dicts/expert';
import { auth } from './dicts/auth';
import { booking } from './dicts/booking';
import { admin } from './dicts/admin';
import { publicPages } from './dicts/public';

export type { Lang };

const areas: AreaDict[] = [common, experts, user, expert, auth, booking, admin, publicPages];

function merge(lang: Lang): Dict {
  return areas.reduce<Dict>((acc, area) => ({ ...acc, ...area[lang] }), {});
}

export const dictionary: Record<Lang, Dict> = {
  bn: merge('bn'),
  en: merge('en'),
};
