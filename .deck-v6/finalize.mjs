import { finalizePresentation } from '/Users/Darsh/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations/container_tools/artifact_tool_utils.mjs';

const root = '/Users/Darsh/Desktop/xylem';
const skill = '/Users/Darsh/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const finalPath = `${root}/DRAFTS/Lead_Service_Line_Data_Story_v6.pptx`;

const result = await finalizePresentation({
  workspaceDir: root,
  candidatePath: `${root}/.deck-v6/candidate-with-data.pptx`,
  finalPath,
  pythonExecutable: '/Users/Darsh/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
  integrityValidatorPath: `${skill}/container_tools/inspect_presentation_package_integrity.py`,
  layoutValidatorPath: `${skill}/container_tools/inspect_presentation_layout_geometry.py`,
  layoutArgs: [
    '--expected-slide-size-emu', '12192000,6858000',
    '--validate-bullet-geometry', '--validate-heading-fit',
  ],
  explicitTotalSlideCount: 5,
  requiredNativeChartOwnerSlides: [2, 3, 4],
  materializeLiteralChartWorkbooks: false,
  fontPolicy: {
    basis: 'design', families: ['Inter', 'Arial'],
  },
  verifyArtifactToolImport: true,
  receiptPath: `${root}/.deck-v6/validation-final.json`,
});
console.log(JSON.stringify(result, null, 2));
