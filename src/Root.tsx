import { Composition, Folder } from "remotion";
import { MvicTest } from "./MvicTest";
import { LeNomSceneTest } from "./le-nom/SceneTest";
import { Proof3D } from "./three/Proof3D";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="LeNom">
        <Composition id="LeNomSceneTest" component={LeNomSceneTest} durationInFrames={510} fps={30} width={1080} height={1920} />
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
