import { v4 } from "uuid";
import { Guid as GuidTypescript } from "guid-typescript";
import { Guid as EzGuid } from "ez-guid";
import { Guid as TypescriptGuid } from "typescript-guid";
import { Guid as MyGuid } from "./src/Guid";
import ReactUuid from 'react-uuid';
import { debugGuid } from "./src/util/debugGuid";
import { percent } from "./src/util/percent";
import { explainBytes } from "./src/util/explainBytes";

const numberToGenerate = 5000;
const debugThreshold = 5;
const debugValid = false;

const tests = {
  "guid-typescript": GuidTypescript.create,
  "ez-guid": EzGuid.create,
  "typescript-guid": TypescriptGuid.create,
  "react-uuid": ReactUuid,
  uuid: v4,
  "my-guid": MyGuid.newGuid,
  "my-comb-guid": MyGuid.newCombGuid,
};

const titleWidth = Math.max(...Object.keys(tests).map(k => k.length));

if (crypto && crypto.randomUUID) {
  console.info('Your environment has the crypto API. Adding native test for crypto.randomUUID()');
  tests["native"] = () => crypto.randomUUID();
}

performance.mark('all-tests');
for (let [libraryName, cons] of Object.entries(tests)) {
  let libraryErrors = 0;
  performance.mark(libraryName);
  for (let i = 0; i < numberToGenerate; i++) {
    let obj = cons();
    let str = obj.toString();
    if (MyGuid.isValidV4HexString(str)) {
      if(debugThreshold >= numberToGenerate && debugValid){
        debugGuid(str);
      }
    } else {
      if (debugThreshold >= numberToGenerate) {
        debugGuid(str);
      }
      libraryErrors++;
    }
  }
  const benchmark = performance.measure(libraryName);

  const librarySuccesses = numberToGenerate - libraryErrors;

  console.log(
    libraryName.padEnd(titleWidth+3, " "),
    // "|",
    libraryErrors > 0 ? 'FAIL' : 'PASS',
    `${librarySuccesses.toLocaleString()}/${numberToGenerate.toLocaleString()} VALID`.padStart(
      10 + numberToGenerate.toLocaleString().length * 2,
      " "
    ),
    `${percent(librarySuccesses, numberToGenerate)} PASS`.padStart(16, " "),
    `${percent(libraryErrors, numberToGenerate)} FAIL`.padStart(16, " "),
    `${benchmark.duration.toLocaleString()} ms`.padStart(16, ' ')
  );
}
performance.clearMeasures();
performance.clearMarks();

console.log(MyGuid.Empty.toString());

// uncomment to see how the special fields are calculated
// for(let i = 0; i< 5; i++){
//   let guid = MyGuid.newGuid();
//   explainBytes(guid.toBytes());
// }