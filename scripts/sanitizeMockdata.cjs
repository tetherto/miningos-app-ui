#!/usr/bin/env node

/**
 * Script to sanitize mock data by removing sensitive information
 * 
 * Usage:
 * 1. Copy window.__mockdata from browser console
 * 2. Save it to a file (e.g., mockdata-raw.json)
 * 3. Run: npm run sanitize-mockdata mockdata-raw.json
 * 4. Output will be saved to src/mockdata/*.json (auto-split by default)
 * 
 * Options:
 *   --no-split           Save to single file src/mockdata.ts instead of splitting
 *   --split <target>     Save to specific src/mockdata/<target>.json file
 *   --split-merge <target>  Merge with specific src/mockdata/<target>.json file
 * 
 * Default behavior: Auto-split by feature with merge enabled
 */

const fs = require('fs')
const path = require('path')

// Get input file and options from command line arguments
const args = process.argv.slice(2)
const inputFile = args.find(arg => !arg.startsWith('--')) || 'mockdata-raw.json'
const noSplit = args.includes('--no-split')
const splitIndex = args.indexOf('--split')
const splitMergeIndex = args.indexOf('--split-merge')
const splitTarget = splitIndex !== -1 ? args[splitIndex + 1] : 
                    splitMergeIndex !== -1 ? args[splitMergeIndex + 1] : null
const shouldSplitMerge = splitMergeIndex !== -1

// Default behavior: auto-split with merge enabled
const shouldAutoSplit = !noSplit && !splitTarget
const shouldMerge = shouldAutoSplit || shouldSplitMerge

const inputPath = path.resolve(process.cwd(), inputFile)

// Determine output path based on split option
let outputPath
let outputFormat = 'ts' // 'ts' or 'json'

if (splitTarget) {
  // Split mode: save to src/mockdata/<target>.json
  const mockdataDir = path.resolve(process.cwd(), 'src/mockdata')
  if (!fs.existsSync(mockdataDir)) {
    fs.mkdirSync(mockdataDir, { recursive: true })
  }
  outputPath = path.join(mockdataDir, `${splitTarget}.json`)
  outputFormat = 'json'
} else {
  // Normal mode: save to src/mockdata.ts
  outputPath = path.resolve(process.cwd(), 'src/mockdata.ts')
  outputFormat = 'ts'
}

// Check if input file exists
if (!fs.existsSync(inputPath)) {
  console.error(`❌ Error: Input file not found: ${inputPath}`)
  console.log('\nUsage:')
  console.log('  npm run sanitize-mockdata [input-file] [options]')
  console.log('\nExamples:')
  console.log('  npm run sanitize-mockdata                    # Uses mockdata-raw.json (default)')
  console.log('  npm run sanitize-mockdata my-capture.json    # Use custom file')
  console.log('  npm run sanitize-mockdata -- --no-split      # Save to single file')
  console.log('\nDefault behavior:')
  console.log('  ✓ Input file: mockdata-raw.json')
  console.log('  ✓ Auto-split by feature (base, containers, financial, etc.)')
  console.log('  ✓ Merge with existing files (keeps old data)')
  console.log('  ✓ Saves to src/mockdata/*.json')
  console.log('\nOptions:')
  console.log('  --no-split               Save to single file src/mockdata.ts instead')
  console.log('  --split <target>         Save to specific src/mockdata/<target>.json')
  console.log('  --split-merge <target>   Merge with specific src/mockdata/<target>.json')
  process.exit(1)
}

console.log('🔍 Reading new mock data from:', inputPath)

// Read the input file
let rawData
try {
  const fileContent = fs.readFileSync(inputPath, 'utf8')
  
  // Try to parse as JSON first
  try {
    rawData = JSON.parse(fileContent)
  } catch (e) {
    // If it fails, try to extract JSON from JavaScript assignment
    const match = fileContent.match(/window\.__mockdata\s*=\s*({[\s\S]*})/)
    if (match) {
      rawData = JSON.parse(match[1])
    } else {
      throw new Error('Could not parse file as JSON or extract from JavaScript')
    }
  }
} catch (error) {
  console.error('❌ Error reading/parsing input file:', error.message)
  process.exit(1)
}

// If merge mode, read existing file
let existingData = {}
if ((shouldMerge || shouldSplitMerge) && fs.existsSync(outputPath)) {
  console.log(`🔄 Merge mode: Reading existing ${path.basename(outputPath)}...`)
  try {
    const existingContent = fs.readFileSync(outputPath, 'utf8')
    
    if (outputFormat === 'json') {
      // JSON file
      existingData = JSON.parse(existingContent)
    } else {
      // TypeScript file
      const match = existingContent.match(/window\.__mockdata\s*=\s*({[\s\S]*})/)
      if (match) {
        existingData = JSON.parse(match[1])
      }
    }
    
    console.log(`  ✓ Found ${Object.keys(existingData).length} existing entries`)
  } catch (error) {
    console.warn(`⚠️  Warning: Could not read existing ${path.basename(outputPath)}, will create new file`)
  }
}

// Merge data if in merge mode
if (shouldMerge || shouldSplitMerge) {
  console.log(`📊 Merging data...`)
  console.log(`  - Existing entries: ${Object.keys(existingData).length}`)
  console.log(`  - New entries: ${Object.keys(rawData).length}`)
  
  // Merge: new data overwrites existing data for same keys
  rawData = { ...existingData, ...rawData }
  
  console.log(`  ✓ Total entries after merge: ${Object.keys(rawData).length}`)
}

console.log('🧹 Sanitizing sensitive data...')

// Convert to JSON string for regex replacement
let jsonString = JSON.stringify(rawData, null, 2)

// Count replacements
let tokenCount = 0
let emailCount = 0

// Replace API tokens
// Pattern: pub:api:TOKEN-123-roles:*
const tokenRegex = /(?<=pub:api:)[^:]+(?=-\d+-roles:\*)/g
jsonString = jsonString.replace(tokenRegex, (match) => {
  tokenCount++
  return 'SANITIZED_TOKEN'
})

// Replace email addresses
const emailRegex = /\b[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g
jsonString = jsonString.replace(emailRegex, (match) => {
  emailCount++
  return 'mail@example.com'
})

// Additional sanitization patterns
// Replace potential auth tokens in headers or bearer tokens
const bearerRegex = /"Bearer\s+[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"/g
jsonString = jsonString.replace(bearerRegex, '"Bearer SANITIZED_JWT_TOKEN"')

// Replace potential API keys
const apiKeyRegex = /"[Aa]pi[_-]?[Kk]ey":\s*"[^"]+"/g
jsonString = jsonString.replace(apiKeyRegex, '"api_key": "SANITIZED_API_KEY"')

// Replace location/site names (case-insensitive)
let locationCount = 0
const locationPatterns = [
  /\b(SITE)\b/gi,
  /"site":\s*"[^"]+"/g,
  /"location":\s*"[^"]+"/g,
  /"address":\s*"[^"]+"/g,
  /"city":\s*"[^"]+"/g,
  /"country":\s*"[^"]+"/g,
  /"region":\s*"[^"]+"/g
]

locationPatterns.forEach(pattern => {
  jsonString = jsonString.replace(pattern, (match) => {
    locationCount++
    // Preserve the JSON structure
    if (match.includes('"site":')) return '"site": "Site A"'
    if (match.includes('"location":')) return '"location": "Location A"'
    if (match.includes('"address":')) return '"address": "123 Main St"'
    if (match.includes('"city":')) return '"city": "City A"'
    if (match.includes('"country":')) return '"country": "Country A"'
    if (match.includes('"region":')) return '"region": "Region A"'
    return 'Site A' // For plain text matches
  })
})

// Replace IP addresses (private and public)
let ipCount = 0
const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
jsonString = jsonString.replace(ipRegex, (match) => {
  ipCount++
  return '192.168.1.1'
})

// Replace MAC addresses
let macCount = 0
const macRegex = /\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b/g
jsonString = jsonString.replace(macRegex, (match) => {
  macCount++
  return '00:00:00:00:00:00'
})

// Replace phone numbers (only if in phone/tel/mobile fields)
let phoneCount = 0
const phoneFieldRegex = /"(phone|tel|mobile|contact)":\s*"([^"]+)"/gi
jsonString = jsonString.replace(phoneFieldRegex, (match, field) => {
  phoneCount++
  return `"${field}": "+1-555-0100"`
})

console.log(`  ✓ Replaced ${tokenCount} API tokens`)
console.log(`  ✓ Replaced ${emailCount} email addresses`)
if (locationCount > 0) console.log(`  ✓ Replaced ${locationCount} location references`)
if (ipCount > 0) console.log(`  ✓ Replaced ${ipCount} IP addresses`)
if (macCount > 0) console.log(`  ✓ Replaced ${macCount} MAC addresses`)
if (phoneCount > 0) console.log(`  ✓ Replaced ${phoneCount} phone numbers`)

// Parse back to object to ensure valid JSON
let sanitizedData
try {
  sanitizedData = JSON.parse(jsonString)
} catch (error) {
  console.error('❌ Error: Sanitized data is not valid JSON:', error.message)
  process.exit(1)
}

// Auto-split mode: categorize data by feature
if (shouldAutoSplit) {
  console.log('\n🔀 Auto-splitting data by feature...')
  
  const categories = categorizeData(sanitizedData)
  const mockdataDir = path.resolve(process.cwd(), 'src/mockdata')
  
  if (!fs.existsSync(mockdataDir)) {
    fs.mkdirSync(mockdataDir, { recursive: true })
  }
  
  // Write each category to its own file
  let totalSize = 0
  for (const [category, data] of Object.entries(categories)) {
    const categoryPath = path.join(mockdataDir, `${category}.json`)
    
    // Merge with existing if file exists
    let finalData = data
    if (fs.existsSync(categoryPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(categoryPath, 'utf8'))
        finalData = { ...existing, ...data }
        console.log(`  📝 ${category}.json (merged ${Object.keys(data).length} entries)`)
      } catch (e) {
        console.log(`  📝 ${category}.json (${Object.keys(data).length} entries)`)
      }
    } else {
      console.log(`  📝 ${category}.json (${Object.keys(data).length} entries)`)
    }
    
    const content = JSON.stringify(finalData, null, 2) + '\n'
    fs.writeFileSync(categoryPath, content, 'utf8')
    totalSize += Buffer.byteLength(content, 'utf8')
  }
  
  // Update index.ts to import all categories
  updateIndexFile(Object.keys(categories))
  
  const inputSize = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(2)
  const outputSize = (totalSize / 1024 / 1024).toFixed(2)
  
  console.log('\n✅ Done!')
  console.log(`   Input size:   ${inputSize} MB`)
  console.log(`   Output size:  ${outputSize} MB`)
  console.log(`   Split into:   ${Object.keys(categories).length} files`)
  console.log(`   Saved to:     src/mockdata/*.json`)
  console.log('\n📝 Next steps:')
  console.log('   1. Update import in src/app/services/api.ts:')
  console.log('      import \'../../mockdata/index\'')
  console.log('   2. Test the app with: npm run start:demo')
  console.log('   3. Verify all features are accessible')
  
} else {
  // Normal mode: single file output
  let outputContent
  if (outputFormat === 'json') {
    // JSON format for split files
    outputContent = JSON.stringify(sanitizedData, null, 2) + '\n'
  } else {
    // TypeScript format for main mockdata.ts
    outputContent = `window.__mockdata = ${JSON.stringify(sanitizedData, null, 2)}\n`
  }

  // Write to output file
  console.log('💾 Writing sanitized data to:', outputPath)
  fs.writeFileSync(outputPath, outputContent, 'utf8')

  // Get file sizes
  const inputSize = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(2)
  const outputSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)

  console.log('\n✅ Done!')
  console.log(`   Input size:  ${inputSize} MB`)
  console.log(`   Output size: ${outputSize} MB`)
  console.log(`   Saved to:    ${outputPath}`)
  console.log('\n📝 Next steps:')
  console.log('   1. Review the sanitized file to ensure no sensitive data remains')
  console.log('   2. Test the app with: npm run start:demo')
  console.log('   3. Verify all containers are accessible')
}

/**
 * Categorize mock data by feature based on URL patterns
 */
function categorizeData(data) {
  const categories = {
    base: {},
    containers: {},
    financial: {},
    operations: {},
    alerts: {},
    inventory: {},
    pools: {},
    comments: {},
    settings: {},
    other: {}
  }
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    
    // Determine category based on key pattern
    if (lowerKey.includes('featureconfig') || lowerKey.includes('features-') || 
        lowerKey.includes('user') || lowerKey.includes('auth') || 
        lowerKey.includes('token-') || lowerKey.includes('permissions-') ||
        lowerKey.includes('global-config')) {
      categories.base[key] = value
    } else if (lowerKey.includes('container') || lowerKey.includes('bitdeer-') ||
               lowerKey.includes('bitmain-') || lowerKey.includes('microbt-') ||
               lowerKey.includes('emca-') || lowerKey.includes('site-')) {
      categories.containers[key] = value
    } else if (lowerKey.includes('financial') || lowerKey.includes('revenue') || 
               lowerKey.includes('cost') || lowerKey.includes('ebitda') || 
               lowerKey.includes('energy') || lowerKey.includes('hash-balance') ||
               lowerKey.includes('subsidy')) {
      categories.financial[key] = value
    } else if (lowerKey.includes('miner-') || lowerKey.includes('mining') ||
               lowerKey.includes('hashrate') || lowerKey.includes('site-overview') ||
               lowerKey.includes('global-data') || lowerKey.includes('ext-data') ||
               lowerKey.includes('actions-') || lowerKey.includes('list-racks') ||
               lowerKey.includes('list-things') || lowerKey.includes('thing-config')) {
      categories.operations[key] = value
    } else if (lowerKey.includes('alert') || lowerKey.includes('history-log') ||
               lowerKey.includes('tail-log')) {
      categories.alerts[key] = value
    } else if (lowerKey.includes('inventory') || lowerKey.includes('ticket-management')) {
      categories.inventory[key] = value
    } else if (lowerKey.includes('pool')) {
      categories.pools[key] = value
    } else if (lowerKey.includes('comment')) {
      categories.comments[key] = value
    } else if (lowerKey.includes('setting')) {
      categories.settings[key] = value
    } else {
      categories.other[key] = value
    }
  }
  
  // Remove empty categories
  return Object.fromEntries(
    Object.entries(categories).filter(([_, data]) => Object.keys(data).length > 0)
  )
}

/**
 * Update index.ts to import all category files
 */
function updateIndexFile(categories) {
  const indexPath = path.resolve(process.cwd(), 'src/mockdata/index.ts')
  
  const imports = categories.map(cat => `import ${cat}Data from './${cat}.json'`).join('\n')
  const mergeArgs = categories.map(cat => `${cat}Data`).join(',\n  ')
  
  const content = `/**
 * Mock data entry point
 * 
 * This file merges all mock data from separate JSON files.
 * Auto-generated by sanitizeMockdata.js --auto-split
 */

// Import mock data files
${imports}

/**
 * Simple object merge utility
 * Merges multiple objects into one, with later objects overwriting earlier ones
 */
function mergeMockData(...sources: Record<string, any>[]): Record<string, any> {
  return Object.assign({}, ...sources)
}

// Merge all mock data
const mockdata = mergeMockData(
  ${mergeArgs}
)

// Assign to global window object
window.__mockdata = mockdata

export default mockdata
`
  
  fs.writeFileSync(indexPath, content, 'utf8')
  console.log('  ✓ Updated src/mockdata/index.ts')
}
