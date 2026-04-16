const fs = require('fs');
const path = require('path');
const readline = require('readline');

const sourceDir = path.join(__dirname, '..', '.agent');
const configFile = path.join(sourceDir, 'agent-config.json');
const projectRoot = path.join(__dirname, '..');

const KNOWN_AGENTS = ['.opencode', '.kiro', '.claude', '.cursor', '.windsurf', '.agent'];

function loadConfig() {
  if (fs.existsSync(configFile)) {
    return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  }
  return { agents: {}, ignoredSkills: {} };
}

function saveConfig(config) {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

function isOpenspecInstalled() {
  try {
    const { execSync } = require('child_process');
    execSync('openspec --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getAgentFolders() {
  const KNOWN_AGENTS = ['opencode', 'kiro', 'claude', 'cursor', 'windsurf'];
  const items = fs.readdirSync(projectRoot);
  return items.filter(item => {
    if (!item.startsWith('.')) return false;
    if (item === '.git' || item === '.agent') return false;
    const itemPath = path.join(projectRoot, item);
    if (!fs.statSync(itemPath).isDirectory()) return false;
    const agentName = item.slice(1);
    return KNOWN_AGENTS.includes(agentName) || fs.existsSync(path.join(itemPath, 'skills'));
  });
}

function detectNewSkills(agentDir) {
  const newSkills = [];
  const sourceSkillsDir = path.join(sourceDir, 'skills');
  const agentSkillsDir = path.join(agentDir, 'skills');

  if (!fs.existsSync(agentSkillsDir)) return [];

  const agentSkills = fs.readdirSync(agentSkillsDir);

  for (const skill of agentSkills) {
    const skillDir = path.join(agentSkillsDir, skill);
    if (!fs.statSync(skillDir).isDirectory()) continue;

    if (!fs.existsSync(path.join(sourceSkillsDir, skill))) {
      newSkills.push(skill);
    }
  }

  return newSkills;
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function syncDirectory(src, dest, extensions = ['.md'], mapping = null) {
  if (!fs.existsSync(src)) return [];

  const copied = [];
  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destFolderName = mapping && mapping[item] ? mapping[item] : item;
    const destPath = path.join(dest, destFolderName);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      const subMapping = mapping && mapping[item] ? { [mapping[item]]: mapping[item] } : null;
      const subCopied = syncDirectory(srcPath, destPath, extensions, subMapping);
      copied.push(`${item} -> ${destFolderName}: ${subCopied.length} archivos`);
    } else {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        copyFile(srcPath, destPath);
        copied.push(item);
      }
    }
  }

  return copied;
}

function question(prompt) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function syncAgent(agentDir, config, specificAgent = null) {
  const agentName = path.basename(agentDir).slice(1);
  const fullAgentName = '.' + agentName;

  if (specificAgent && fullAgentName !== specificAgent) {
    return;
  }

  console.log(`\n📁 Sincronizando con ${fullAgentName}/`);

  const hasOpenspec = isOpenspecInstalled();

  if (!hasOpenspec) {
    console.log(`   ⚠️  OpenSpec no está instalado. Solo sincronizando archivos base (skills).`);
    const skillsDir = path.join(sourceDir, 'skills');
    const destSkillsDir = path.join(agentDir, 'skills');
    const copied = fs.existsSync(skillsDir)
      ? syncDirectory(skillsDir, destSkillsDir, ['.md'], mapping)
      : [];
    console.log(`   ✅ Copiados: ${copied.length} skills`);
    return;
  }

  const mapping = config.folderMapping && config.folderMapping[agentName]
    ? config.folderMapping[agentName]
    : null;

  if (mapping) {
    console.log(`   📂 Mapeo: ${JSON.stringify(mapping)}`);
  }

  const copied = syncDirectory(sourceDir, agentDir, ['.md'], mapping);
  console.log(`   ✅ Copiados: ${copied.length} elementos`);

  if (!config.ignoredSkills) config.ignoredSkills = {};

  const newSkills = detectNewSkills(agentDir);
  const ignored = config.ignoredSkills[agentName] || [];

  for (const skill of newSkills) {
    if (ignored.includes(skill)) {
      console.log(`   ⏭️  Skill '${skill}' ignorada (configurada previously)`);
      continue;
    }

    console.log(`\n🔍 Nueva skill detectada: '${skill}' en ${agentName}/`);

    const shouldAdd = await question('   ¿Agregar a .agent/ (base)? (s/n): ');

    if (shouldAdd.toLowerCase() === 's') {
      const sourceSkillDir = path.join(sourceDir, 'skills', skill);
      const destSkillDir = path.join(agentDir, 'skills', skill);

      if (fs.existsSync(destSkillDir)) {
        copyFile(destSkillDir, sourceSkillDir);
        console.log(`   ✅ '${skill}' agregada a .agent/`);
      }
    } else {
      if (!config.ignoredSkills[agentName]) {
        config.ignoredSkills[agentName] = [];
      }
      config.ignoredSkills[agentName].push(skill);
      console.log(`   ❌ '${skill}' ignorada para futuras sincronizaciones`);
    }
  }
}

async function createNewAgent(agentName) {
  const targetDir = path.join(projectRoot, agentName);
  const agentKey = agentName.startsWith('.') ? agentName.slice(1) : agentName;

  if (fs.existsSync(targetDir)) {
    console.log(`⚠️  La carpeta ${agentName}/ ya existe`);
    return;
  }

  console.log(`Creando carpeta ${agentName}/...`);
  fs.mkdirSync(targetDir, { recursive: true });

  const config = loadConfig();
  const hasOpenspec = isOpenspecInstalled();
  const mapping = config.folderMapping && config.folderMapping[agentKey]
    ? config.folderMapping[agentKey]
    : null;

  if (!hasOpenspec) {
    console.log(`   ⚠️  OpenSpec no está instalado. Creando carpeta con solo skills base.`);
    const skillsDir = path.join(sourceDir, 'skills');
    const destSkillsDir = path.join(targetDir, 'skills');
    if (fs.existsSync(skillsDir)) {
      fs.mkdirSync(destSkillsDir, { recursive: true });
      syncDirectory(skillsDir, destSkillsDir, ['.md'], mapping);
    }
    console.log(`✅ Carpeta creada`);
    return;
  }

  const copied = syncDirectory(sourceDir, targetDir, ['.md'], mapping);
  console.log(`✅ Carpeta creada y sincronizada con ${copied.length} elementos`);
}

async function main() {
  const args = process.argv.slice(2);
  const specificAgent = args.includes('--agent')
    ? args[args.indexOf('--agent') + 1]
    : null;
  const showHelp = args.includes('--help') || args.includes('-h');

  if (showHelp) {
    console.log(`
Agent Capabilities Sync

Usage: node sync-agents.js [options]

Options:
  --agent <name>  Sincronizar solo el agente especificado
  --new <name>   Crear un nuevo agente
  --force       Forzar sincronización de openspec aunque no esté instalado
  --help, -h     Mostrar esta ayuda

Examples:
  node scripts/sync-agents.js                    # Sincronizar todos los agentes
  node scripts/sync-agents.js --agent .claude    # Solo sincronizar .claude
  node scripts/sync-agents.js --new .windsurf   # Crear nuevo agente .windsurf
  node scripts/sync-agents.js --force            # Forzar sincronización de openspec
`);
    return;
  }

  const newAgentIndex = args.indexOf('--new');
  if (newAgentIndex !== -1 && args[newAgentIndex + 1]) {
    await createNewAgent(args[newAgentIndex + 1]);
    return;
  }

  const forceOpenspec = args.includes('--force');
  const hasOpenspec = forceOpenspec || isOpenspecInstalled();

  console.log('🔄 Agent Capabilities Sync\n');
  console.log('📂 Fuente: .agent/');
  if (!hasOpenspec && !forceOpenspec) {
    console.log('⚠️  OpenSpec NO está instalado. Solo se sincronizarán skills base.\n');
  }

  const config = loadConfig();
  const agentFolders = getAgentFolders();

  if (agentFolders.length === 0) {
    console.log('\n⚠️  No se detectaron carpetas de agentes en el proyecto');

    const agentType = await question('\n¿Qué agente vas a usar? (ej: .claude, .cursor): ');

    if (agentType) {
      const agentName = agentType.startsWith('.') ? agentType : '.' + agentType;
      await createNewAgent(agentName);
    }
    return;
  }

  console.log(`\n📁 Agentes detectados: ${agentFolders.join(', ')}`);

  for (const agentDir of agentFolders) {
    const fullPath = path.join(projectRoot, agentDir);
    await syncAgent(fullPath, config, specificAgent);
  }

  saveConfig(config);
  console.log('\n✅ Sincronización completa');
}

main().catch(console.error);