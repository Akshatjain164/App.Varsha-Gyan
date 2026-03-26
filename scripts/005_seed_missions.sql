-- Seed all 14 missions with English and Hindi content
INSERT INTO public.missions (title_en, title_hi, description_en, description_hi, instructions_en, instructions_hi, subject, target_class, simulation_type, difficulty, complexity_level, xp_reward, icon_name, theme_color) VALUES

-- Class 6 Missions (Complexity Level 1 - Beginner)
(
  'Light & Shadows',
  'प्रकाश और छाया',
  'Explore how light creates shadows by positioning objects and light sources. Understand umbra and penumbra.',
  'वस्तुओं और प्रकाश स्रोतों को रखकर देखें कि प्रकाश कैसे छाया बनाता है। छाया और उपछाया को समझें।',
  'Move the torch around to see how shadows change. Try placing different objects between the light and the screen.',
  'छाया कैसे बदलती है यह देखने के लिए टॉर्च को इधर-उधर घुमाएं। प्रकाश और स्क्रीन के बीच विभिन्न वस्तुएं रखने का प्रयास करें।',
  'physics', 6, 'light-shadows', 'beginner', 1, 100, 'Sun', '#00d4ff'
),
(
  'Number Line Adventure',
  'संख्या रेखा साहसिक',
  'Jump along the number line to add and subtract whole numbers. Help the character reach the target!',
  'पूर्ण संख्याओं को जोड़ने और घटाने के लिए संख्या रेखा पर कूदें। चरित्र को लक्ष्य तक पहुंचने में मदद करें!',
  'Click the + or - buttons to move along the number line. Reach the target number to complete each level.',
  'संख्या रेखा पर आगे बढ़ने के लिए + या - बटन पर क्लिक करें। प्रत्येक स्तर को पूरा करने के लिए लक्ष्य संख्या तक पहुंचें।',
  'mathematics', 6, 'number-line-basic', 'beginner', 1, 100, 'Calculator', '#00d4ff'
),

-- Class 7 Missions (Complexity Level 2 - Beginner+)
(
  'Heat Transfer Lab',
  'ऊष्मा स्थानांतरण प्रयोगशाला',
  'Watch heat flow between objects through conduction. Compare how different materials transfer heat.',
  'चालन के माध्यम से वस्तुओं के बीच ऊष्मा प्रवाह देखें। विभिन्न सामग्रियों की ऊष्मा स्थानांतरण क्षमता की तुलना करें।',
  'Select different materials and watch the temperature change over time. The color shows the temperature.',
  'विभिन्न सामग्रियों का चयन करें और समय के साथ तापमान परिवर्तन देखें। रंग तापमान दर्शाता है।',
  'physics', 7, 'heat-transfer', 'beginner', 2, 120, 'Thermometer', '#00d4ff'
),
(
  'Plant Cell Explorer',
  'पादप कोशिका अन्वेषक',
  'Dive into a plant cell and discover its organelles. Learn the function of each part.',
  'पादप कोशिका में गोता लगाएं और इसके अंगकों की खोज करें। प्रत्येक भाग के कार्य को जानें।',
  'Click on different parts of the cell to zoom in and learn about them. Match the labels to complete the mission.',
  'ज़ूम इन करने और उनके बारे में जानने के लिए सेल के विभिन्न हिस्सों पर क्लिक करें। मिशन पूरा करने के लिए लेबल का मिलान करें।',
  'biology', 7, 'plant-cell', 'beginner', 2, 120, 'Leaf', '#00d4ff'
),

-- Class 8 Missions (Complexity Level 3 - Intermediate)
(
  'Friction Laboratory',
  'घर्षण प्रयोगशाला',
  'Experiment with friction forces on different surfaces. Measure the force needed to move objects.',
  'विभिन्न सतहों पर घर्षण बलों के साथ प्रयोग करें। वस्तुओं को हिलाने के लिए आवश्यक बल को मापें।',
  'Select a surface type and apply force to the block. Observe how friction affects motion.',
  'सतह का प्रकार चुनें और ब्लॉक पर बल लगाएं। देखें कि घर्षण गति को कैसे प्रभावित करता है।',
  'physics', 8, 'friction-lab', 'intermediate', 3, 150, 'Box', '#3b82f6'
),
(
  'Chemical Reaction Builder',
  'रासायनिक अभिक्रिया निर्माता',
  'Combine elements to create chemical reactions. Balance equations and classify reaction types.',
  'रासायनिक अभिक्रियाएं बनाने के लिए तत्वों को मिलाएं। समीकरणों को संतुलित करें और अभिक्रिया प्रकारों को वर्गीकृत करें।',
  'Drag elements from the periodic table to the reaction zone. Watch the reaction happen and balance the equation.',
  'आवर्त सारणी से तत्वों को अभिक्रिया क्षेत्र में खींचें। अभिक्रिया होते देखें और समीकरण को संतुलित करें।',
  'chemistry', 8, 'chemical-reactions', 'intermediate', 3, 150, 'FlaskConical', '#3b82f6'
),

-- Class 9 Missions (Complexity Level 4 - Intermediate+)
(
  'Projectile Motion',
  'प्रक्षेप्य गति',
  'Launch projectiles and study their trajectory. Adjust angle and velocity to hit targets.',
  'प्रक्षेप्य लॉन्च करें और उनके प्रक्षेपवक्र का अध्ययन करें। लक्ष्य को भेदने के लिए कोण और वेग समायोजित करें।',
  'Set the launch angle and initial velocity. Observe the parabolic path and calculate range and maximum height.',
  'लॉन्च कोण और प्रारंभिक वेग सेट करें। परवलयिक पथ देखें और रेंज और अधिकतम ऊंचाई की गणना करें।',
  'physics', 9, 'projectile-motion', 'intermediate', 4, 180, 'Crosshair', '#3b82f6'
),
(
  'pH Scale Laboratory',
  'pH स्केल प्रयोगशाला',
  'Test various substances on the pH scale. Understand acids, bases, and neutral solutions.',
  'pH स्केल पर विभिन्न पदार्थों का परीक्षण करें। अम्ल, क्षार और उदासीन विलयनों को समझें।',
  'Drag substances into the testing beaker. Observe the pH reading and color change of the indicator.',
  'पदार्थों को परीक्षण बीकर में खींचें। pH रीडिंग और संकेतक के रंग परिवर्तन को देखें।',
  'chemistry', 9, 'ph-scale', 'intermediate', 4, 180, 'TestTube', '#3b82f6'
),

-- Class 10 Missions (Complexity Level 5 - Advanced)
(
  'Ohm''s Law Circuit',
  'ओम का नियम सर्किट',
  'Build electrical circuits and verify Ohm''s law. Plot V-I graphs and calculate resistance.',
  'विद्युत परिपथ बनाएं और ओम के नियम को सत्यापित करें। V-I ग्राफ बनाएं और प्रतिरोध की गणना करें।',
  'Connect components to build a circuit. Vary voltage and measure current to verify V=IR.',
  'सर्किट बनाने के लिए घटकों को जोड़ें। V=IR को सत्यापित करने के लिए वोल्टेज बदलें और करंट मापें।',
  'physics', 10, 'ohms-law', 'advanced', 5, 200, 'Zap', '#a855f7'
),
(
  'Osmosis & Diffusion',
  'परासरण और विसरण',
  'Visualize how molecules move across cell membranes. Understand osmotic pressure and concentration gradients.',
  'देखें कि अणु कोशिका झिल्ली के पार कैसे गति करते हैं। परासरण दाब और सांद्रता प्रवणता को समझें।',
  'Adjust the concentration on each side of the membrane. Watch molecules move and observe equilibrium.',
  'झिल्ली के प्रत्येक तरफ सांद्रता समायोजित करें। अणुओं की गति देखें और संतुलन का निरीक्षण करें।',
  'biology', 10, 'osmosis-diffusion', 'advanced', 5, 200, 'Droplets', '#a855f7'
),

-- Class 11 Missions (Complexity Level 6 - Advanced+)
(
  'Vector Operations',
  'सदिश संक्रियाएं',
  'Perform vector addition, subtraction, and find components. Visualize resultant vectors.',
  'सदिश जोड़, घटाव और घटक खोजें। परिणामी सदिशों को देखें।',
  'Draw vectors by clicking and dragging. Use the tools to add vectors and find their resultant.',
  'क्लिक और ड्रैग करके सदिश बनाएं। सदिशों को जोड़ने और उनका परिणामी खोजने के लिए टूल का उपयोग करें।',
  'physics', 11, 'vector-operations', 'advanced', 6, 220, 'ArrowUpRight', '#a855f7'
),
(
  'Electromagnetic Induction',
  'विद्युत चुम्बकीय प्रेरण',
  'Generate electricity by moving magnets through coils. Explore Faraday''s and Lenz''s laws.',
  'कुंडलियों के माध्यम से चुंबक को घुमाकर बिजली उत्पन्न करें। फैराडे और लेंज के नियमों का अन्वेषण करें।',
  'Move the magnet through the coil and observe the induced current. Vary speed and magnet strength.',
  'चुंबक को कुंडली के माध्यम से घुमाएं और प्रेरित धारा देखें। गति और चुंबक शक्ति बदलें।',
  'physics', 11, 'em-induction', 'advanced', 6, 220, 'Magnet', '#a855f7'
),

-- Class 12 Missions (Complexity Level 7 - Expert)
(
  'Wave Optics',
  'तरंग प्रकाशिकी',
  'Observe interference and diffraction patterns. Calculate path differences and fringe spacing.',
  'व्यतिकरण और विवर्तन पैटर्न देखें। पथ अंतर और फ्रिंज स्पेसिंग की गणना करें।',
  'Adjust slit width and separation. Observe the diffraction pattern and measure fringe positions.',
  'स्लिट चौड़ाई और पृथक्करण समायोजित करें। विवर्तन पैटर्न देखें और फ्रिंज स्थिति मापें।',
  'physics', 12, 'wave-optics', 'expert', 7, 250, 'Waves', '#f59e0b'
),
(
  'Semiconductor Physics',
  'अर्धचालक भौतिकी',
  'Explore P-N junctions and their behavior under bias. Plot characteristic curves.',
  'P-N जंक्शन और बायस के तहत उनके व्यवहार का अन्वेषण करें। अभिलाक्षणिक वक्र बनाएं।',
  'Apply forward and reverse bias to the diode. Observe current flow and plot the I-V characteristics.',
  'डायोड पर अग्र और पश्च बायस लागू करें। धारा प्रवाह देखें और I-V अभिलक्षण बनाएं।',
  'physics', 12, 'semiconductors', 'expert', 7, 250, 'Cpu', '#f59e0b'
);
