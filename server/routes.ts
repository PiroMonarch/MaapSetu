import express from 'express';
import fs from 'fs';
import path from 'path';
import { Instrument, Report, TestResult, User, ComplianceRule } from './models';
import PDFDocument from 'pdfkit';

const router = express.Router();

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && user.password === password) {
    res.json({ id: user._id, email: user.email, name: user.name });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Instruments
router.get('/instruments', async (req, res) => {
  const query = req.query.q ? {
    $or: [
      { model: new RegExp(req.query.q as string, 'i') },
      { manufacturer: new RegExp(req.query.q as string, 'i') }
    ]
  } : {};
  const instruments = await Instrument.find(query);
  res.json(instruments);
});

// Users
router.get('/users', async (req, res) => {
  const users = await User.find().select('name email role');
  res.json(users);
});

router.post('/instruments', async (req, res) => {
  const instrument = await Instrument.create(req.body);
  res.json(instrument);
});

router.get('/instruments/:id', async (req, res) => {
  const instrument = await Instrument.findById(req.params.id);
  res.json(instrument);
});

// Reports
router.get('/reports', async (req, res) => {
  const reports = await Report.find().populate('instrumentId').sort('-updatedAt');
  res.json(reports);
});

router.post('/reports', async (req, res) => {
  const report = await Report.create(req.body);
  res.json(report);
});

router.get('/reports/:id', async (req, res) => {
  const report = await Report.findById(req.params.id).populate('instrumentId');
  const results = await TestResult.find({ reportId: req.params.id });
  res.json({ ...report?.toObject(), testResults: results });
});

router.put('/reports/:id', async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(report);
});

// Test Results
router.post('/reports/:id/tests', async (req, res) => {
  const { testName, data, passed } = req.body;
  const result = await TestResult.findOneAndUpdate(
    { reportId: req.params.id, testName },
    { data, passed },
    { new: true, upsert: true }
  );
  res.json(result);
});

// PDF Generation — improved layout and styling
router.get('/reports/:id/pdf', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('instrumentId');
    const results = await TestResult.find({ reportId: req.params.id });

    if (!report) return res.status(404).send("Report not found");

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Report-${report.applicationNo}.pdf`);
    doc.pipe(res);

    // Track pages for footer
    let pageNumber = 1;
    const addFooter = () => {
      const bottom = doc.page.height - 40;
      doc.fontSize(9).fillColor('grey').text(`Page ${pageNumber}`, 50, bottom, { align: 'center', width: doc.page.width - 100 });
    };

    doc.on('pageAdded', () => {
      pageNumber += 1;
      addFooter();
    });

    // Header
    const headerY = 50;
    const logoPath = (() => {
      // prefer project-provided logo at public/assets/logo.png or aistudio folder image if present
      const candidates = [
        path.join(process.cwd(), 'public', 'assets', 'logo.png'),
        path.join(process.cwd(), 'public', 'assets', 'aistudio', 'logo.png')
      ];
      for (const p of candidates) if (fs.existsSync(p)) return p;
      return null;
    })();

    if (logoPath) {
      try {
        doc.image(logoPath, 50, headerY - 10, { fit: [80, 80] });
      } catch (e) {
        // ignore image errors
      }
    }

    doc.fillColor('#0f172a').fontSize(20).font('Helvetica-Bold').text('Calibration Report', logoPath ? 150 : 50, headerY, { align: 'left' });
    doc.moveDown(2);

    // Basic report info box
    doc.fontSize(10).fillColor('#0f172a');
    const infoTop = doc.y;
    const leftColX = 50;
    const rightColX = 320;
    const infoLineHeight = 14;

    doc.rect(leftColX - 6, infoTop - 6, doc.page.width - 100, 80).stroke('#e6e6e6');

    doc.font('Helvetica').fontSize(11).text(`Application No: ${report.applicationNo}`, leftColX, infoTop);
    doc.text(`Date: ${new Date(report.date || new Date()).toLocaleDateString()}`);
    doc.text(`Inspector: ${report.inspector}`);
    doc.text(`Status: ${report.status}`);

    doc.moveDown();

    // Instrument Details table-like layout
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#0b1220').text('Instrument Details');
    doc.moveDown(0.2);
    const instrument: any = report.instrumentId || {};
    const startY = doc.y;

    const left = 60;
    const colGap = 220;
    doc.font('Helvetica').fontSize(11).fillColor('#111827');
    doc.text('Manufacturer:', left, startY);
    doc.text(instrument.manufacturer || '-', left + 100, startY);
    doc.text('Model:', left + colGap, startY);
    doc.text(instrument.model || '-', left + colGap + 50, startY);

    doc.text('Serial Number:', left, startY + infoLineHeight);
    doc.text(instrument.serialNumber || '-', left + 100, startY + infoLineHeight);
    doc.text('Max Capacity:', left + colGap, startY + infoLineHeight);
    doc.text(instrument.maxCapacity?.toString() || '-', left + colGap + 50, startY + infoLineHeight);

    doc.moveDown(2);

    // Test Results heading
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#0b1220').text('Test Results');
    doc.moveDown(0.5);

    // Render a simple table for test results
    const tableLeft = 50;
    const col1Width = 200; // Test name
    const col2Width = doc.page.width - 100 - col1Width; // Details
    const rowHeight = 18;

    // Table header
    doc.save().rect(tableLeft, doc.y, doc.page.width - 100, rowHeight).fill('#f3f4f6').restore();
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text('Test', tableLeft + 6, doc.y + 4, { width: col1Width - 12 });
    doc.text('Result / Details', tableLeft + col1Width + 6, doc.y + 4, { width: col2Width - 12 });
    doc.moveDown();

    doc.font('Helvetica').fontSize(10);
    let toggle = false;
    for (const result of results) {
      // Ensure there's space, add page if needed
      if (doc.y + 120 > doc.page.height - 80) doc.addPage();

      const y = doc.y;
      // Row background
      if (toggle) doc.save().rect(tableLeft, y, doc.page.width - 100, rowHeight * 3).fill('#ffffff').restore();
      else doc.save().rect(tableLeft, y, doc.page.width - 100, rowHeight * 3).fill('#fbfbfb').restore();

      doc.fillColor('#0b1220').font('Helvetica-Bold').text(result.testName, tableLeft + 6, y + 4, { width: col1Width - 12 });

      // Pretty-print result.data object as key: value lines
      const data = typeof result.data === 'object' ? result.data : { value: result.data };
      const keys = Object.keys(data as any);
      let detailY = y + 4;
      doc.font('Helvetica').fontSize(10).fillColor('#111827');
      for (const k of keys) {
        const v = (data as any)[k];
        doc.text(`${k}: ${v}`, tableLeft + col1Width + 8, detailY, { width: col2Width - 16 });
        detailY += 12;
      }

      doc.moveDown(3);
      toggle = !toggle;
    }

    // Remarks
    if (report.remarks) {
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(12).text('Remarks');
      doc.font('Helvetica').fontSize(10).text(report.remarks);
    }

    // Finalize footer for first page
    addFooter();

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).send("Error generating PDF");
  }
});

export { router as apiRouter };
