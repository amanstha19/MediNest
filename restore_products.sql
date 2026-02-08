INSERT INTO myapp_product (id, name, generic_name, description, price, stock, prescription_required, created_at, updated_at)
VALUES 
(5, 'Tylenol', 'Pantoprazole', 'Pantoprazole is a proton pump inhibitor that decreases the amount of acid produced in the stomach.', 10.00, 960, FALSE, NOW(), NOW()),
(6, 'Amoxil', 'Amoxicillin', 'Amoxicillin is used to treat a wide variety of bacterial infections.', 200.00, 1999, FALSE, NOW(), NOW()),
(7, 'Azistra', 'Azithromycin', 'Azithromycin is used to treat certain bacterial infections.', 150.00, 222, TRUE, NOW(), NOW()),
(8, 'Vitamin C', 'Vitamin C', 'Vitamin C helps the body make collagen, a protein that is used to create skin, cartilage, tendons, ligaments, and blood vessels.', 50.00, 898, FALSE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
