import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("public/images", exist_ok=True)

def create_dashboard(title, subtitle, badge, accent_color, lines_data, chart_points, filename):
    width, height = 1200, 750
    img = Image.new("RGBA", (width, height), (7, 11, 22, 255))
    draw = ImageDraw.Draw(img)

    # Gradient background / soft glow
    for y in range(height):
        ratio = y / height
        r = int(7 + 10 * ratio)
        g = int(11 + 14 * ratio)
        b = int(22 + 25 * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    # Glow blob in top-right
    for radius in range(250, 0, -10):
        alpha = int(15 * (1 - radius / 250))
        glow_color = tuple(list(accent_color[:3]) + [alpha])
        draw.ellipse([width - 350 - radius, -50 - radius, width - 350 + radius, -50 + radius], fill=glow_color)

    # Window bar
    draw.rectangle([0, 0, width, 48], fill=(12, 18, 34, 255))
    draw.line([(0, 48), (width, 48)], fill=(30, 41, 66, 255), width=1)
    
    # Window buttons
    draw.ellipse([24, 18, 36, 30], fill=(239, 68, 68, 220))
    draw.ellipse([44, 18, 56, 30], fill=(245, 158, 11, 220))
    draw.ellipse([64, 18, 76, 30], fill=(16, 185, 129, 220))

    # Window title
    draw.text((100, 16), "SmartPilot Watch · Market Intelligence Core", fill=(148, 163, 184, 255))
    draw.rectangle([width - 160, 12, width - 24, 36], fill=(20, 32, 58, 255), outline=(59, 130, 246, 100), width=1)
    draw.ellipse([width - 150, 22, width - 142, 30], fill=(16, 185, 129, 255))
    draw.text((width - 134, 16), "LIVE 60 FPS", fill=(56, 189, 248, 255))

    # Sidebar
    draw.rectangle([0, 49, 220, height], fill=(9, 14, 28, 255))
    draw.line([(220, 49), (220, height)], fill=(26, 38, 62, 255), width=1)
    nav_items = ["Overview", "My Watchlist", "Smart Changes", "Market Map 3D", "SmartPilot AI", "Signal Isolation", "Change Replay"]
    for i, item in enumerate(nav_items):
        y_pos = 80 + i * 44
        is_active = (i == 0 if "Overview" in title else (1 if "Watchlist" in title else (2 if "Signal" in title else (3 if "Map" in title else 4))))
        if is_active == i:
            draw.rectangle([16, y_pos, 204, y_pos + 36], fill=(30, 58, 110, 180), outline=(56, 189, 248, 120), width=1)
            draw.text((36, y_pos + 10), item, fill=(255, 255, 255, 255))
            draw.ellipse([26, y_pos + 15, 30, y_pos + 19], fill=(56, 189, 248, 255))
        else:
            draw.text((36, y_pos + 10), item, fill=(100, 116, 139, 255))

    # Content Area
    # Header Banner
    draw.text((250, 70), title.upper(), fill=(56, 189, 248, 255))
    draw.text((250, 95), subtitle, fill=(255, 255, 255, 255))
    draw.rectangle([width - 240, 75, width - 40, 105], fill=(20, 35, 65, 255), outline=accent_color, width=1)
    draw.text((width - 225, 82), badge, fill=accent_color)

    # Top Metric Cards (3 cards)
    card_w = (width - 250 - 40 - 32) // 3
    for c in range(3):
        cx = 250 + c * (card_w + 16)
        cy = 135
        draw.rectangle([cx, cy, cx + card_w, cy + 90], fill=(13, 22, 42, 220), outline=(36, 52, 85, 255), width=1)
        if c == 0:
            draw.text((cx + 16, cy + 12), "ATTENTION BUDGET", fill=(100, 116, 139, 255))
            draw.text((cx + 16, cy + 34), "4 Signals Isolated", fill=(255, 255, 255, 255))
            draw.text((cx + 16, cy + 62), "82% noise filtered", fill=(16, 185, 129, 255))
        elif c == 1:
            draw.text((cx + 16, cy + 12), "NIFTY 50 RELATIVE", fill=(100, 116, 139, 255))
            draw.text((cx + 16, cy + 34), "24,412.40  -0.42%", fill=(244, 63, 94, 255))
            draw.text((cx + 16, cy + 62), "Broad sector weakness", fill=(148, 163, 184, 255))
        else:
            draw.text((cx + 16, cy + 12), "AI CONFIDENCE", fill=(100, 116, 139, 255))
            draw.text((cx + 16, cy + 34), "94.8% Validated", fill=(56, 189, 248, 255))
            draw.text((cx + 16, cy + 62), "Cross-peer correlation", fill=(16, 185, 129, 255))

    # Main Chart / Visual Area
    panel_y = 245
    panel_h = 240
    draw.rectangle([250, panel_y, width - 40, panel_y + panel_h], fill=(11, 19, 36, 220), outline=(32, 48, 78, 255), width=1)
    draw.text((270, panel_y + 16), "INTRADAY TEMPORAL INTELLIGENCE & SIGNAL SPREAD", fill=(148, 163, 184, 255))
    
    # Grid lines inside chart
    for gy in range(panel_y + 50, panel_y + panel_h - 20, 40):
        draw.line([(270, gy), (width - 60, gy)], fill=(20, 32, 54, 255), width=1)

    # Chart curve
    if chart_points and len(chart_points) > 1:
        scaled_points = []
        for px, py in chart_points:
            sx = 270 + int(px * (width - 330))
            sy = panel_y + panel_h - 30 - int(py * 140)
            scaled_points.append((sx, sy))
        
        # Area under curve
        area_polygon = [(scaled_points[0][0], panel_y + panel_h - 25)] + scaled_points + [(scaled_points[-1][0], panel_y + panel_h - 25)]
        draw.polygon(area_polygon, fill=(accent_color[0], accent_color[1], accent_color[2], 35))

        for i in range(len(scaled_points) - 1):
            draw.line([scaled_points[i], scaled_points[i + 1]], fill=accent_color, width=3)
            # Pulse dots
            if i % 3 == 0:
                draw.ellipse([scaled_points[i][0] - 4, scaled_points[i][1] - 4, scaled_points[i][0] + 4, scaled_points[i][1] + 4], fill=(255, 255, 255, 255))

    # Bottom Table / Insights Feed
    table_y = 505
    draw.rectangle([250, table_y, width - 40, height - 25], fill=(11, 19, 36, 220), outline=(32, 48, 78, 255), width=1)
    draw.text((270, table_y + 14), "TICKER", fill=(100, 116, 139, 255))
    draw.text((400, table_y + 14), "PRICE", fill=(100, 116, 139, 255))
    draw.text((520, table_y + 14), "CHANGE", fill=(100, 116, 139, 255))
    draw.text((640, table_y + 14), "ISOLATION SCORE", fill=(100, 116, 139, 255))
    draw.text((800, table_y + 14), "SMARTPILOT AI REASONING", fill=(100, 116, 139, 255))
    draw.line([(260, table_y + 36), (width - 50, table_y + 36)], fill=(24, 38, 64, 255), width=1)

    for r_idx, (ticker, price, chg, score, note, is_up) in enumerate(lines_data[:4]):
        row_y = table_y + 44 + r_idx * 40
        chg_color = (16, 185, 129, 255) if is_up else (244, 63, 94, 255)
        draw.text((270, row_y), ticker, fill=(255, 255, 255, 255))
        draw.text((400, row_y), price, fill=(226, 232, 240, 255))
        draw.text((520, row_y), chg, fill=chg_color)
        
        # Score pill
        pill_fill = (16, 185, 129, 40) if score > 75 else (56, 189, 248, 40)
        pill_stroke = (16, 185, 129, 180) if score > 75 else (56, 189, 248, 180)
        draw.rectangle([640, row_y - 2, 720, row_y + 20], fill=pill_fill, outline=pill_stroke, width=1)
        draw.text((655, row_y), f"★ {score}", fill=(255, 255, 255, 255))

        draw.text((800, row_y), note[:50] + "...", fill=(148, 163, 184, 255))
        if r_idx < 3:
            draw.line([(260, row_y + 28), (width - 50, row_y + 28)], fill=(18, 28, 48, 255), width=1)

    img.save(filename, "PNG")
    print(f"Saved: {filename}")

# Generate 5 realistic, breathtaking screenshots
points_1 = [(0.0, 0.2), (0.15, 0.35), (0.3, 0.25), (0.45, 0.65), (0.6, 0.55), (0.75, 0.85), (0.9, 0.7), (1.0, 0.95)]
points_2 = [(0.0, 0.8), (0.15, 0.75), (0.3, 0.5), (0.45, 0.35), (0.6, 0.4), (0.75, 0.2), (0.9, 0.25), (1.0, 0.15)]
points_3 = [(0.0, 0.4), (0.2, 0.45), (0.4, 0.7), (0.6, 0.65), (0.8, 0.9), (1.0, 0.88)]
points_4 = [(0.0, 0.3), (0.2, 0.5), (0.4, 0.45), (0.6, 0.8), (0.8, 0.75), (1.0, 0.92)]
points_5 = [(0.0, 0.5), (0.25, 0.3), (0.5, 0.6), (0.75, 0.45), (1.0, 0.7)]

feed_data = [
    ("TCS", "₹3,862.40", "+4.2%", 88, "Substantially outperforming broad tech peers on US deals", True),
    ("RELIANCE", "₹1,412.60", "-3.8%", 91, "2.6x unusual volume spike with energy sector divergence", False),
    ("HDFCBANK", "₹1,743.20", "+1.1%", 43, "Modest move broadly tracking banking sector average", True),
    ("INFY", "₹1,488.15", "-1.9%", 58, "Movement closely aligned with NASDAQ / IT index", False),
]

create_dashboard(
    "Overview & Signal Intelligence", 
    "Real-Time Market Context & Attention Prioritizer", 
    "SIGNAL ISOLATION: 88%", 
    (56, 189, 248, 255), 
    feed_data, 
    points_1, 
    "public/images/dashboard-overview.png"
)

create_dashboard(
    "Smart Watchlist Matrix", 
    "Relative Movement vs Sector & NIFTY 50", 
    "MARKET RELATIVE: ACTIVE", 
    (16, 185, 129, 255), 
    feed_data, 
    points_2, 
    "public/images/dashboard-watchlist.png"
)

create_dashboard(
    "Signal Isolation Engine", 
    "Company-Specific Signal vs Market & Peer Noise", 
    "NOISE FILTER: 92%", 
    (139, 92, 246, 255), 
    feed_data, 
    points_3, 
    "public/images/dashboard-isolation.png"
)

create_dashboard(
    "SmartPilot AI Market Agent", 
    "Autonomous Context Reasoning & What-Changed Trace", 
    "NEURAL MODEL: ONLINE", 
    (59, 130, 246, 255), 
    feed_data, 
    points_4, 
    "public/images/dashboard-smartpilot.png"
)

create_dashboard(
    "Change Replay & Temporal Graph", 
    "Full Intraday Event Development Sequence", 
    "TIMELINE REPLAY", 
    (245, 158, 11, 255), 
    feed_data, 
    points_5, 
    "public/images/dashboard-replay.png"
)

# Also create numbered aliases dashboard-1.png .. dashboard-5.png
import shutil
shutil.copyfile("public/images/dashboard-overview.png", "public/images/dashboard-1.png")
shutil.copyfile("public/images/dashboard-watchlist.png", "public/images/dashboard-2.png")
shutil.copyfile("public/images/dashboard-isolation.png", "public/images/dashboard-3.png")
shutil.copyfile("public/images/dashboard-smartpilot.png", "public/images/dashboard-4.png")
shutil.copyfile("public/images/dashboard-replay.png", "public/images/dashboard-5.png")
print("All dashboard images successfully generated in public/images!")
