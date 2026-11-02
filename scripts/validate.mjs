import {readFileSync, existsSync} from 'node:fs';
const data=JSON.parse(readFileSync('data/content.json','utf8'));
const html=readFileSync('index.html','utf8');
const failures=[];
for(const key of ['about','work','experience','skills','credentials','contact']) if(!html.includes(`id="${key}"`))failures.push(`Missing section ${key}`);
for(const project of data.projects)if(!html.includes(`id="project-${project.slug}"`))failures.push(`Missing project ${project.slug}`);
if(data.projects.length!==5)failures.push('Expected five projects');
if(!existsSync('deploy-site/public/motion-bundle.js')||!html.includes('public/motion-bundle.js'))failures.push('Motion bundle missing from build output');
if(!html.includes('mailto:'+data.profile.email))failures.push('Missing email link');
if(!html.includes(data.profile.linkedin))failures.push('Missing LinkedIn link');
if(existsSync('public/resume.pdf')!==html.includes('href="public/resume.pdf"'))failures.push('Resume state differs from file availability; rebuild');
if(!html.includes('prefers-reduced-motion')&&!readFileSync('public/style.css','utf8').includes('prefers-reduced-motion'))failures.push('Missing reduced motion rules');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Validation passed: sections, five project anchors, contact links, resume state, motion bundle and reduced motion rules.');
