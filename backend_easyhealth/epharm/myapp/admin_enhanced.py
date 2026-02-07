"""
Enhanced Admin Configuration for Prescription Verification
Adds comprehensive OCR extraction display and order connection details
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import PrescriptionVerification, Order, userPayment
from .admin import admin_site


class PrescriptionVerificationEnhancedAdmin(admin.ModelAdmin):
    """
    Enhanced admin for Prescription Verification with comprehensive OCR details
    """
    list_display = (
        'id', 'status_badge', 'order_summary', 'prescription_thumbnail',
        'doctor_info', 'hospital_info', 'medicine_summary',
        'ocr_confidence_badge', 'patient_summary', 'created_at'
    )
    list_filter = ('status', 'ocr_confidence', 'department', 'created_at')
    search_fields = (
        'order__id', 'extracted_nmc_number', 'doctor_name', 
        'hospital_name', 'department', 'patient_name', 'verification_notes'
    )
    readonly_fields = (
        'created_at', 'updated_at', 'order_details', 'prescription_image_display',
        'ocr_raw_text_display', 'extracted_medicines_display', 'patient_info_display',
        'ocr_metadata_display', 'order_connection_display'
    )
    list_editable = ('status',)
    actions = ['approve_prescriptions', 'reject_prescriptions', 'reprocess_ocr']
    
    fieldsets = (
        ('Order Connection', {
            'fields': ('order', 'order_connection_display'),
            'classes': ('wide',)
        }),
        ('Prescription Image', {
            'fields': ('prescription_image', 'prescription_image_display'),
            'classes': ('wide',)
        }),
        ('OCR Extracted Doctor Information', {
            'fields': (
                'extracted_nmc_number', 'doctor_name', 'hospital_name', 
                'department', 'ocr_confidence'
            ),
            'classes': ('collapse',)
        }),
        ('OCR Extracted Patient Information', {
            'fields': ('patient_info_display',),
            'classes': ('collapse',)
        }),
        ('OCR Extracted Medicines', {
            'fields': ('extracted_medicines_display',),
            'classes': ('wide', 'collapse')
        }),
        ('OCR Raw Data', {
            'fields': ('ocr_raw_text_display', 'ocr_metadata_display'),
            'classes': ('collapse',)
        }),
        ('Verification Status', {
            'fields': ('status', 'verified_by', 'verification_notes', 'verified_at')
        }),
    )
    
    def order_summary(self, obj):
        """Display order summary with link"""
        if obj.order:
            url = f"/admin/myapp/order/{obj.order.id}/change/"
            user = obj.order.user
            return format_html(
                '<div style="line-height:1.4;">'
                '<a href="{}" style="font-weight:bold;color:#667eea;">Order #{}</a><br>'
                '<small style="color:#666;">{}</small><br>'
                '<small style="color:#666;">{}</small>'
                '</div>',
                url, obj.order.id,
                user.username if user else 'No user',
                user.email if user else ''
            )
        return format_html('<span style="color:#dc3545;">No Order</span>')
    order_summary.short_description = 'Order Info'
    
    def prescription_thumbnail(self, obj):
        """Display prescription thumbnail"""
        if obj.prescription_image:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="width:80px;height:80px;object-fit:cover;'
                'border-radius:6px;border:2px solid #667eea;" />'
                '</a>',
                obj.prescription_image.url, obj.prescription_image.url
            )
        return format_html(
            '<div style="width:80px;height:80px;background:#f8f9fa;'
            'border-radius:6px;border:2px dashed #dee2e6;display:flex;'
            'align-items:center;justify-content:center;color:#6c757d;'
            'font-size:11px;">No Image</div>'
        )
    prescription_thumbnail.short_description = 'Prescription'
    
    def doctor_info(self, obj):
        """Display doctor information from OCR"""
        if obj.doctor_name or obj.extracted_nmc_number:
            html = '<div style="line-height:1.5;">'
            if obj.doctor_name:
                html += f'<div><strong style="color:#333;">Dr. {obj.doctor_name}</strong></div>'
            if obj.extracted_nmc_number:
                html += f'<div><small style="color:#666;">NMC: {obj.extracted_nmc_number}</small></div>'
            if obj.department:
                html += f'<div><small style="color:#17a2b8;">{obj.department}</small></div>'
            html += '</div>'
            return format_html(html)
        return format_html('<span style="color:#6c757d;">Not detected</span>')
    doctor_info.short_description = 'Doctor Info'
    
    def hospital_info(self, obj):
        """Display hospital information"""
        if obj.hospital_name:
            return format_html(
                '<div style="line-height:1.4;">'
                '<div style="font-weight:500;color:#333;">{}</div>'
                '</div>',
                obj.hospital_name
            )
        return format_html('<span style="color:#6c757d;">-</span>')
    hospital_info.short_description = 'Hospital'
    
    def medicine_summary(self, obj):
        """Display medicine count and summary"""
        if obj.medicine_list and isinstance(obj.medicine_list, list):
            count = len(obj.medicine_list)
            if count > 0:
                # Show first 2 medicines
                meds_preview = []
                for med in obj.medicine_list[:2]:
                    if isinstance(med, dict):
                        name = med.get('name', 'Unknown')
                        dosage = med.get('dosage', '')
                        meds_preview.append(f"{name} {dosage}")
                
                preview_text = ', '.join(meds_preview)
                if count > 2:
                    preview_text += f' <span style="color:#667eea;">+{count-2} more</span>'
                
                return format_html(
                    '<div style="line-height:1.4;">'
                    '<span style="background:#17a2b8;color:white;padding:2px 8px;'
                    'border-radius:10px;font-size:11px;font-weight:600;">{} meds</span>'
                    '<div style="margin-top:4px;font-size:12px;color:#555;">{}</div>'
                    '</div>',
                    count, preview_text
                )
        
        return format_html(
            '<span style="background:#6c757d;color:white;padding:2px 8px;'
            'border-radius:10px;font-size:11px;">0 meds</span>'
        )
    medicine_summary.short_description = 'Medicines'
    
    def patient_summary(self, obj):
        """Display patient information summary"""
        if obj.patient_name or obj.patient_age or obj.patient_gender:
            html = '<div style="line-height:1.4;font-size:12px;">'
            if obj.patient_name:
                html += f'<div><strong>{obj.patient_name}</strong></div>'
            details = []
            if obj.patient_age:
                details.append(obj.patient_age)
            if obj.patient_gender:
                details.append(obj.patient_gender)
            if details:
                html += f'<div style="color:#666;">{", ".join(details)}</div>'
            html += '</div>'
            return format_html(html)
        return format_html('<span style="color:#6c757d;">-</span>')
    patient_summary.short_description = 'Patient'
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'pending': '#ffc107',
            'approved': '#28a745',
            'rejected': '#dc3545',
        }
        return format_html(
            '<span style="background:{};color:white;padding:4px 12px;'
            'border-radius:15px;font-size:11px;font-weight:600;">{}</span>',
            colors.get(obj.status, '#6c757d'), obj.status.upper()
        )
    status_badge.short_description = 'Status'
    
    def ocr_confidence_badge(self, obj):
        """Display OCR confidence as colored badge"""
        colors = {
            'high': '#28a745',
            'medium': '#ffc107',
            'low': '#dc3545',
        }
        return format_html(
            '<span style="background:{};color:white;padding:4px 12px;'
            'border-radius:15px;font-size:11px;font-weight:600;">{}</span>',
            colors.get(obj.ocr_confidence, '#6c757d'), obj.ocr_confidence.upper()
        )
    ocr_confidence_badge.short_description = 'OCR Quality'
    
    def order_connection_display(self, obj):
        """Display detailed order connection information"""
        if not obj.order:
            return format_html('<div style="color:#dc3545;">No order connected</div>')
        
        order = obj.order
        user = order.user
        
        html = '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
        html += '<h3 style="margin:0 0 10px 0;color:#333;">Order Details</h3>'
        html += '<table style="width:100%;border-collapse:collapse;">'
        
        # Order Info
        html += '<tr><td style="padding:5px;color:#666;">Order ID</td>'
        html += f'<td style="padding:5px;font-weight:600;">#{order.id}</td></tr>'
        
        html += '<tr><td style="padding:5px;color:#666;">Status</td>'
        html += f'<td style="padding:5px;"><span style="background:#667eea;color:white;'
        html += f'padding:2px 8px;border-radius:4px;font-size:12px;">{order.status}</span></td></tr>'
        
        html += '<tr><td style="padding:5px;color:#666;">Total</td>'
        html += f'<td style="padding:5px;font-weight:600;">Rs. {order.total_price}</td></tr>'
        
        html += '<tr><td style="padding:5px;color:#666;">Address</td>'
        html += f'<td style="padding:5px;">{order.address}</td></tr>'
        
        # User Info
        if user:
            html += '<tr><td colspan="2" style="padding:10px 5px;border-top:1px solid #dee2e6;">'
            html += '<strong style="color:#333;">Customer Information</strong></td></tr>'
            
            html += f'<tr><td style="padding:5px;color:#666;">Name</td>'
            html += f'<td style="padding:5px;">{user.get_full_name() or user.username}</td></tr>'
            
            html += f'<tr><td style="padding:5px;color:#666;">Email</td>'
            html += f'<td style="padding:5px;">{user.email}</td></tr>'
            
            html += f'<tr><td style="padding:5px;color:#666;">Phone</td>'
            html += f'<td style="padding:5px;">{user.phone or "N/A"}</td></tr>'
            
            html += f'<tr><td style="padding:5px;color:#666;">City</td>'
            html += f'<td style="padding:5px;">{user.city or "N/A"}</td></tr>'
        
        # Payment Info
        try:
            payment = userPayment.objects.filter(order=order).first()
            if payment:
                html += '<tr><td colspan="2" style="padding:10px 5px;border-top:1px solid #dee2e6;">'
                html += '<strong style="color:#333;">Payment Information</strong></td></tr>'
                
                html += f'<tr><td style="padding:5px;color:#666;">Status</td>'
                html += f'<td style="padding:5px;"><span style="background:#28a745;color:white;'
                html += f'padding:2px 8px;border-radius:4px;font-size:12px;">{payment.status}</span></td></tr>'
                
                html += f'<tr><td style="padding:5px;color:#666;">Method</td>'
                html += f'<td style="padding:5px;">{payment.get_payment_method_display()}</td></tr>'
                
                html += f'<tr><td style="padding:5px;color:#666;">Amount</td>'
                html += f'<td style="padding:5px;font-weight:600;">Rs. {payment.total_amount}</td></tr>'
        except:
            pass
        
        # Cart Items
        items = order.cartitem_set.all()
        if items:
            html += '<tr><td colspan="2" style="padding:10px 5px;border-top:1px solid #dee2e6;">'
            html += f'<strong style="color:#333;">Order Items ({items.count()})</strong></td></tr>'
            html += '<tr><td colspan="2" style="padding:5px;">'
            html += '<div style="display:flex;flex-wrap:wrap;gap:10px;">'
            
            for item in items:
                if item.product:
                    img_url = item.product.image.url if item.product.image else ''
                    html += f'<div style="display:flex;align-items:center;gap:8px;'
                    html += f'background:white;padding:8px;border-radius:6px;border:1px solid #dee2e6;">'
                    if img_url:
                        html += f'<img src="{img_url}" style="width:40px;height:40px;'
                        html += f'object-fit:cover;border-radius:4px;" />'
                    html += f'<div><div style="font-weight:500;font-size:12px;">{item.product.name}</div>'
                    html += f'<div style="font-size:11px;color:#666;">Qty: {item.quantity}</div></div>'
                    html += '</div>'
            
            html += '</div></td></tr>'
        
        html += '</table></div>'
        return format_html(html)
    order_connection_display.short_description = 'Connected Order Details'
    
    def prescription_image_display(self, obj):
        """Display full prescription image"""
        if obj.prescription_image:
            return format_html(
                '<div style="text-align:center;">'
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-width:500px;max-height:500px;'
                'border-radius:8px;border:2px solid #667eea;box-shadow:0 4px 6px rgba(0,0,0,0.1);" />'
                '</a><br>'
                '<small style="color:#666;">Click image to view full size</small>'
                '</div>',
                obj.prescription_image.url, obj.prescription_image.url
            )
        return format_html('<div style="color:#dc3545;">No prescription image uploaded</div>')
    prescription_image_display.short_description = 'Prescription Image'
    
    def extracted_medicines_display(self, obj):
        """Display extracted medicines in a formatted table"""
        if not obj.medicine_list or not isinstance(obj.medicine_list, list):
            return format_html('<div style="color:#6c757d;">No medicines detected by OCR</div>')
        
        html = '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
        html += f'<h3 style="margin:0 0 15px 0;color:#333;">Detected Medicines ({len(obj.medicine_list)})</h3>'
        html += '<table style="width:100%;border-collapse:collapse;background:white;">'
        html += '<thead><tr style="background:#667eea;color:white;">'
        html += '<th style="padding:10px;text-align:left;">#</th>'
        html += '<th style="padding:10px;text-align:left;">Medicine Name</th>'
        html += '<th style="padding:10px;text-align:left;">Dosage</th>'
        html += '<th style="padding:10px;text-align:left;">Frequency</th>'
        html += '<th style="padding:10px;text-align:left;">Duration</th>'
        html += '<th style="padding:10px;text-align:left;">Confidence</th>'
        html += '</tr></thead><tbody>'
        
        for idx, med in enumerate(obj.medicine_list, 1):
            if isinstance(med, dict):
                name = med.get('name', 'Unknown')
                dosage = med.get('dosage', '-')
                frequency = med.get('frequency', '-')
                duration = med.get('duration', '-')
                confidence = med.get('confidence', 'low')
                
                conf_colors = {'high': '#28a745', 'medium': '#ffc107', 'low': '#dc3545'}
                conf_color = conf_colors.get(confidence, '#6c757d')
                
                html += f'<tr style="border-bottom:1px solid #dee2e6;">'
                html += f'<td style="padding:10px;">{idx}</td>'
                html += f'<td style="padding:10px;font-weight:500;">{name}</td>'
                html += f'<td style="padding:10px;">{dosage}</td>'
                html += f'<td style="padding:10px;">{frequency}</td>'
                html += f'<td style="padding:10px;">{duration}</td>'
                html += f'<td style="padding:10px;">'
                html += f'<span style="background:{conf_color};color:white;'
                html += f'padding:2px 8px;border-radius:10px;font-size:11px;">{confidence}</span>'
                html += f'</td></tr>'
        
        html += '</tbody></table></div>'
        return format_html(html)
    extracted_medicines_display.short_description = 'Extracted Medicines'
    
    def patient_info_display(self, obj):
        """Display patient information from OCR"""
        if not any([obj.patient_name, obj.patient_age, obj.patient_gender, obj.chief_complaints]):
            return format_html('<div style="color:#6c757d;">No patient information detected</div>')
        
        html = '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
        html += '<h3 style="margin:0 0 15px 0;color:#333;">Patient Information (OCR)</h3>'
        html += '<table style="width:100%;border-collapse:collapse;">'
        
        if obj.patient_name:
            html += f'<tr><td style="padding:8px;color:#666;width:150px;">Name</td>'
            html += f'<td style="padding:8px;font-weight:500;">{obj.patient_name}</td></tr>'
        
        if obj.patient_age:
            html += f'<tr><td style="padding:8px;color:#666;">Age</td>'
            html += f'<td style="padding:8px;">{obj.patient_age}</td></tr>'
        
        if obj.patient_gender:
            html += f'<tr><td style="padding:8px;color:#666;">Gender</td>'
            html += f'<td style="padding:8px;">{obj.patient_gender}</td></tr>'
        
        if obj.chief_complaints:
            html += f'<tr><td style="padding:8px;color:#666;">Complaints</td>'
            html += f'<td style="padding:8px;">{obj.chief_complaints}</td></tr>'
        
        if obj.followup_date:
            html += f'<tr><td style="padding:8px;color:#666;">Follow-up</td>'
            html += f'<td style="padding:8px;">{obj.followup_date}</td></tr>'
        
        html += '</table></div>'
        return format_html(html)
    patient_info_display.short_description = 'Patient Information'
    
    def ocr_raw_text_display(self, obj):
        """Display raw OCR text"""
        if not obj.ocr_raw_text:
            return format_html('<div style="color:#6c757d;">No raw text available</div>')
        
        return format_html(
            '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
            '<h3 style="margin:0 0 10px 0;color:#333;">Raw OCR Text</h3>'
            '<pre style="background:white;padding:15px;border-radius:6px;'
            'border:1px solid #dee2e6;overflow-x:auto;font-size:12px;'
            'line-height:1.5;max-height:400px;overflow-y:auto;">{}</pre>'
            '</div>',
            obj.ocr_raw_text
        )
    ocr_raw_text_display.short_description = 'Raw OCR Text'
    
    def ocr_metadata_display(self, obj):
        """Display OCR processing metadata"""
        html = '<div style="background:#f8f9fa;padding:15px;border-radius:8px;">'
        html += '<h3 style="margin:0 0 15px 0;color:#333;">OCR Processing Metadata</h3>'
        html += '<table style="width:100%;border-collapse:collapse;">'
        
        html += f'<tr><td style="padding:8px;color:#666;width:200px;">OCR Confidence</td>'
        html += f'<td style="padding:8px;">'
        conf_colors = {'high': '#28a745', 'medium': '#ffc107', 'low': '#dc3545'}
        conf_color = conf_colors.get(obj.ocr_confidence, '#6c757d')
        html += f'<span style="background:{conf_color};color:white;'
        html += f'padding:4px 12px;border-radius:15px;font-size:12px;">'
        html += f'{obj.ocr_confidence.upper()}</span></td></tr>'
        
        html += f'<tr><td style="padding:8px;color:#666;">Created At</td>'
        html += f'<td style="padding:8px;">{obj.created_at}</td></tr>'
        
        html += f'<tr><td style="padding:8px;color:#666;">Updated At</td>'
        html += f'<td style="padding:8px;">{obj.updated_at}</td></tr>'
        
        if obj.verified_at:
            html += f'<tr><td style="padding:8px;color:#666;">Verified At</td>'
            html += f'<td style="padding:8px;">{obj.verified_at}</td></tr>'
        
        if obj.verified_by:
            html += f'<tr><td style="padding:8px;color:#666;">Verified By</td>'
            html += f'<td style="padding:8px;">{obj.verified_by}</td></tr>'
        
        html += '</table></div>'
        return format_html(html)
    ocr_metadata_display.short_description = 'OCR Metadata'
    
    def order_details(self, obj):
        """Legacy method for backward compatibility"""
        return self.order_connection_display(obj)
    order_details.short_description = 'Order Details'
    
    def approve_prescriptions(self, request, queryset):
        """Bulk approve prescriptions"""
        from django.utils import timezone
        updated = queryset.update(
            status='approved', 
            verified_by=request.user, 
            verified_at=timezone.now()
        )
        self.message_user(request, f'{updated} prescription(s) approved successfully.')
    approve_prescriptions.short_description = '✓ Approve selected prescriptions'
    
    def reject_prescriptions(self, request, queryset):
        """Bulk reject prescriptions"""
        from django.utils import timezone
        updated = queryset.update(
            status='rejected', 
            verified_by=request.user, 
            verified_at=timezone.now()
        )
        self.message_user(request, f'{updated} prescription(s) rejected.')
    reject_prescriptions.short_description = '✗ Reject selected prescriptions'
    
    def reprocess_ocr(self, request, queryset):
        """Reprocess OCR for selected prescriptions"""
        from .advanced_ocr_handwriting import enhanced_analyze_prescription
        import os
        
        count = 0
        for verification in queryset:
            if verification.prescription_image:
                try:
                    # Get the image path
                    image_path = verification.prescription_image.path
                    if os.path.exists(image_path):
                        # Reprocess with new OCR
                        result = enhanced_analyze_prescription(image_path)
                        
                        if result['success']:
                            # Update fields
                            verification.extracted_nmc_number = result.get('nmc_number')
                            verification.doctor_name = result.get('doctor_name')
                            verification.hospital_name = result.get('hospital_name')
                            verification.department = result.get('department')
                            verification.medicine_list = result.get('medicines', [])
                            verification.patient_name = result.get('patient_info', {}).get('name')
                            verification.patient_age = result.get('patient_info', {}).get('age')
                            verification.patient_gender = result.get('patient_info', {}).get('gender')
                            verification.chief_complaints = result.get('complaints')
                            verification.followup_date = result.get('followup_date')
                            verification.ocr_confidence = result.get('confidence', 'low')
                            verification.ocr_raw_text = result.get('raw_text', '')[:2000]
                            verification.save()
                            count += 1
                except Exception as e:
                    self.message_user(request, f'Error processing #{verification.id}: {str(e)}', level='error')
        
        self.message_user(request, f'{count} prescription(s) reprocessed successfully.')
    reprocess_ocr.short_description = '🔄 Reprocess OCR'


# Register the enhanced admin
admin_site.unregister(PrescriptionVerification)
admin_site.register(PrescriptionVerification, PrescriptionVerificationEnhancedAdmin)
