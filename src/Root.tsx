import { Composition, Folder } from "remotion";
import { MvicTest } from "./MvicTest";
import { LeNomSceneTest } from "./le-nom/SceneTest";
import { Proof3D } from "./three/Proof3D";
import { FleuveTest } from "./fleuve/FleuveTest";
import { FatherTableTest } from "./papa/FatherTable";
import { PapaSetTest } from "./papa/PapaSet";
import { PapaCut } from "./papa/PapaCut";
import { SonRoomTest } from "./papa/SonRoom";
import { PapaFull } from "./papa/PapaFull";
import { MamanFilm } from "./maman/MamanFilm";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="LeNom">
        <Composition id="LeNomSceneTest" component={LeNomSceneTest} durationInFrames={510} fps={30} width={1080} height={1920} />
      </Folder>
      <Folder name="Maman">
        <Composition id="MamanFilm" component={MamanFilm} durationInFrames={960} fps={24} width={1080} height={1920} />
      </Folder>
      <Folder name="Papa">
        <Composition id="PapaFull" component={PapaFull} durationInFrames={1207} fps={24} width={1080} height={1920} />
        <Composition id="SonRoomTest" component={SonRoomTest} durationInFrames={72} fps={24} width={1080} height={1920} />
        <Composition id="PapaCut" component={PapaCut} durationInFrames={684} fps={24} width={1080} height={1920} />
        <Composition id="PapaSetTest" component={PapaSetTest} durationInFrames={96} fps={24} width={1080} height={1920} />
        <Composition id="PapaTableTest" component={FatherTableTest} durationInFrames={72} fps={24} width={1080} height={1920} />
      </Folder>
      <Folder name="Fleuve">
        <Composition id="FleuveTest" component={FleuveTest} durationInFrames={375} fps={30} width={1080} height={1920} />
      </Folder>
      <Folder name="ThreeD">
        <Composition id="Proof3D" component={Proof3D} durationInFrames={90} fps={30} width={1080} height={1920} />
      </Folder>
      <Folder name="Tests">
        <Composition id="MvicTest01" component={MvicTest} durationInFrames={450} fps={30} width={1080} height={1920} />
      </Folder>
    </>
  );
};
