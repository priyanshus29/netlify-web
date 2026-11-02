"""Create a clearly labelled PDF from Priyanshu's supplied résumé data.
Requires reportlab: pip install reportlab. Normal site builds do not require Python.
"""
import json
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.units import mm
from reportlab.lib.pagesizes import A4

d = json.load(open('data/content.json', encoding='utf-8'))
p = d['profile']
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='ResumeName',fontName='Helvetica-Bold',fontSize=21,leading=24,textColor=colors.HexColor('#102017'),spaceAfter=4))
styles.add(ParagraphStyle(name='ResumeTitle',fontName='Helvetica-Bold',fontSize=10.1,leading=14,textColor=colors.HexColor('#284b32'),spaceAfter=4))
styles.add(ParagraphStyle(name='ResumeContact',fontName='Helvetica',fontSize=8.4,leading=12,textColor=colors.HexColor('#43564a'),spaceAfter=12))
styles.add(ParagraphStyle(name='ResumeHeading',fontName='Helvetica-Bold',fontSize=10.2,leading=14,textColor=colors.HexColor('#183c25'),spaceBefore=12,spaceAfter=5))
styles.add(ParagraphStyle(name='ResumeSub',fontName='Helvetica-Bold',fontSize=9.2,leading=13,textColor=colors.HexColor('#18281e'),spaceBefore=6,spaceAfter=2,keepWithNext=True))
styles.add(ParagraphStyle(name='ResumeBody',fontName='Helvetica',fontSize=8.7,leading=12.5,spaceAfter=4,textColor=colors.HexColor('#202923')))
styles.add(ParagraphStyle(name='ResumeBullet',parent=styles['ResumeBody'],leftIndent=11,firstLineIndent=-8,spaceAfter=3))
styles.add(ParagraphStyle(name='ResumeMeta',fontName='Helvetica-Oblique',fontSize=8.2,leading=11,textColor=colors.HexColor('#526059'),spaceAfter=4))

def para(text, style='ResumeBody'):
    return Paragraph(escape(str(text)), styles[style])
def bullet(text):
    return Paragraph('&#8226; '+escape(str(text)), styles['ResumeBullet'])

doc=SimpleDocTemplate('public/resume.pdf',pagesize=A4,rightMargin=17*mm,leftMargin=17*mm,topMargin=15*mm,bottomMargin=17*mm,title='Priyanshu Singh - Resume',author='Priyanshu Singh')
story=[para(p['name'],'ResumeName'),para('SAP BTP / CAPM | SAP UI5 / Fiori Consultant','ResumeTitle'),para('priyanshudsu@gmail.com  |  +91-9742903254  |  Bengaluru, Karnataka  |  linkedin.com/in/priyanshusingh2903/','ResumeContact'),para('PROFESSIONAL SUMMARY','ResumeHeading')]
for line in p['resumeHighlights']:story.append(bullet(line))
story.append(para('PROFESSIONAL EXPERIENCE','ResumeHeading'))
story.append(para('TruSpeQ Consulting Pvt. Ltd. (SAP Gold Partner) — Bengaluru','ResumeSub'))
for x in d['experience']:story.append(para(f"{x['role']} — {x['dates']}"+(f"  |  {x['designation']}" if x['designation']=='Software Engineer' else ''),'ResumeBody'))
story.append(para('Delivered SAP CAPM and SAP Fiori/UI5 solutions across implementation and support engagements, collaborating with functional and business teams through design, development, integration, deployment and production support.'))
story.append(para('TECHNICAL SKILLS','ResumeHeading'))
for group in d['skills']:story.append(para(group['name'].upper()+': '+', '.join(group['items'])))
story.append(para('SAP PROJECT EXPERIENCE','ResumeHeading'))
for project in d['projects']:
    story.append(para(project['client']+' — '+project['title'],'ResumeSub'))
    story.append(para('Technical Consultant | '+project['category'],'ResumeMeta'))
    if project.get('applications'): story.append(para('Applications: '+', '.join(project['applications'])))
    story.append(bullet(project['context']))
    for item in project.get('resumeDetails',[]):story.append(bullet(item))
story.append(para('CERTIFICATIONS','ResumeHeading'))
for item in d['certifications']:story.append(bullet(item))
story.append(para('ADDITIONAL TRAINING & COURSES','ResumeHeading'))
for item in d['training']:story.append(bullet(item))
story.append(para('EDUCATION','ResumeHeading'))
for item in d['education']:story.append(para(item['degree']+' | '+item['school']+' | '+item['year']))
story.append(para('LANGUAGES','ResumeHeading'))
story.append(para(' · '.join(d['languages'])))
def footer(canvas, doc):
    canvas.saveState();canvas.setStrokeColor(colors.HexColor('#cbd5cb'));canvas.line(17*mm,13*mm,193*mm,13*mm)
    canvas.setFont('Helvetica',7);canvas.setFillColor(colors.HexColor('#526059'));canvas.drawString(17*mm,9*mm,'Formatted from résumé text supplied by Priyanshu Singh');canvas.drawRightString(193*mm,9*mm,str(doc.page));canvas.restoreState()
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print('Created public/resume.pdf from structured résumé data.')
