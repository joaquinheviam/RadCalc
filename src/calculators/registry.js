// Listado de calculadoras: id (usado por STRINGS.calc, REFERENCES y
// SEARCH_TERMS), categoría (catKey, ver STRINGS.categories) y componente.
// El orden dentro de cada categoría es el orden en que se muestran en la
// pantalla principal.
//
// Cada calculadora se carga con React.lazy(): su código JS solo se
// descarga la primera vez que el usuario la abre, en vez de sumarse al
// paquete inicial de la app. En modo offline (PWA) esto no afecta nada,
// porque el service worker precachea igual el archivo de todas las
// calculadoras la primera vez que se visita el sitio.
import { lazy } from 'react';

const TIRADS = lazy(() => import('./TIRADS.jsx'));
const ThymicFat = lazy(() => import('./ThymicFat.jsx'));
const NTMBcdScore = lazy(() => import('./NTMBcdScore.jsx'));
const PEQanadli = lazy(() => import('./PEQanadli.jsx'));
const LungNodule = lazy(() => import('./LungNodule.jsx'));
const LungRADS = lazy(() => import('./LungRADS.jsx'));
const LungScreening = lazy(() => import('./LungScreening.jsx'));
const LungCysts = lazy(() => import('./LungCysts.jsx'));
const EPIDExtent = lazy(() => import('./EPIDExtent.jsx'));
const CADRADS = lazy(() => import('./CADRADS.jsx'));
const MRIFatFraction = lazy(() => import('./MRIFatFraction.jsx'));
const HepaticSiderosis = lazy(() => import('./HepaticSiderosis.jsx'));
const LIRADS = lazy(() => import('./LIRADS.jsx'));
const LIRADSTreatmentResponse = lazy(() => import('./LIRADSTreatmentResponse.jsx'));
const PancreatitisAtlanta = lazy(() => import('./PancreatitisAtlanta.jsx'));
const PancreasResect = lazy(() => import('./PancreasResect.jsx'));
const PancreaticCyst = lazy(() => import('./PancreaticCyst.jsx'));
const Cholangiocarcinoma = lazy(() => import('./Cholangiocarcinoma.jsx'));
const SpleenSize = lazy(() => import('./SpleenSize.jsx'));
const LIRADSUS = lazy(() => import('./LIRADSUS.jsx'));
const AdrenalWashout = lazy(() => import('./AdrenalWashout.jsx'));
const AdrenalCSI = lazy(() => import('./AdrenalCSI.jsx'));
const PSADCalculator = lazy(() => import('./PSADCalculator.jsx'));
const PIRADS = lazy(() => import('./PIRADS.jsx'));
const RenalScore = lazy(() => import('./RenalScore.jsx'));
const Bosniak = lazy(() => import('./Bosniak.jsx'));
const CCLS = lazy(() => import('./CCLS.jsx'));
const VIRADS = lazy(() => import('./VIRADS.jsx'));
const ORADS = lazy(() => import('./ORADS.jsx'));
const UterineFibroids = lazy(() => import('./UterineFibroids.jsx'));

export const calculators = [
  // Cabeza y cuello
  { id: 'tirads', catKey: 'cabezaCuello', component: TIRADS },
  // Tórax
  { id: 'thymic', catKey: 'torax', component: ThymicFat },
  { id: 'ntmBcd', catKey: 'torax', component: NTMBcdScore },
  { id: 'peQanadli', catKey: 'torax', component: PEQanadli },
  { id: 'lungNodule', catKey: 'torax', component: LungNodule },
  { id: 'lungRads', catKey: 'torax', component: LungRADS },
  { id: 'lungScreening', catKey: 'torax', component: LungScreening },
  { id: 'lungCysts', catKey: 'torax', component: LungCysts },
  { id: 'epidExtent', catKey: 'torax', component: EPIDExtent },
  // Cardiovascular
  { id: 'cadrads', catKey: 'cardio', component: CADRADS },
  // Abdomen (hepatobiliopancreático y suprarrenal)
  { id: 'mriFf', catKey: 'abdomen', component: MRIFatFraction },
  { id: 'siderosis', catKey: 'abdomen', component: HepaticSiderosis },
  { id: 'lirads', catKey: 'abdomen', component: LIRADS },
  { id: 'liradsTr', catKey: 'abdomen', component: LIRADSTreatmentResponse },
  { id: 'liradsUs', catKey: 'abdomen', component: LIRADSUS },
  { id: 'pancreatitisAtlanta', catKey: 'abdomen', component: PancreatitisAtlanta },
  { id: 'pancreasResect', catKey: 'abdomen', component: PancreasResect },
  { id: 'pancreaticCyst', catKey: 'abdomen', component: PancreaticCyst },
  { id: 'cholangiocarcinoma', catKey: 'abdomen', component: Cholangiocarcinoma },
  { id: 'spleenSize', catKey: 'abdomen', component: SpleenSize },
  { id: 'adrenalCt', catKey: 'abdomen', component: AdrenalWashout },
  { id: 'adrenalMri', catKey: 'abdomen', component: AdrenalCSI },
  // Genitourinario (próstata, riñón, vejiga)
  { id: 'psad', catKey: 'gu', component: PSADCalculator },
  { id: 'pirads', catKey: 'gu', component: PIRADS },
  { id: 'renalScore', catKey: 'gu', component: RenalScore },
  { id: 'bosniak', catKey: 'gu', component: Bosniak },
  { id: 'ccls', catKey: 'gu', component: CCLS },
  { id: 'virads', catKey: 'gu', component: VIRADS },
  // Ginecología
  { id: 'orads', catKey: 'gyn', component: ORADS },
  { id: 'leiomyoma', catKey: 'gyn', component: UterineFibroids },
];

export const categoryOrder = ['cabezaCuello', 'torax', 'cardio', 'abdomen', 'gu', 'gyn'];
