#!/usr/bin/env python3
"""
Validators - Check if GIFs meet Slack's requirements.

These validators help ensure your GIFs meet Slack's size and dimension constraints.
"""

from pathlib import Path


def validate_gif(
    gif_path: str | Path, is_emoji: bool = True, verbose: bool = True
) -> tuple[bool, dict]:
    """
    Validate GIF for Slack (dimensions, size, frame count).

    Args:
        gif_path: Path to GIF file
        is_emoji: True for emoji (128x128 recommended), False for message GIF
        verbose: Print validation details

    Returns:
        Tuple of (passes: bool, results: dict with all details)
    """
    from PIL import Image

    gif_path = Path(gif_path)

    if not gif_path.exists():
        return False, {"error": f"File not found: {gif_path}"}

    # Get file size
    size_bytes = gif_path.stat().st_size
    size_kb = size_bytes / 1024
    size_mb = size_kb / 1024

    # Get dimensions and frame info
    try:
        with Image.open(gif_path) as img:
            width, height = img.size

            # Count frames
            frame_count = 0
            try:
                while True:
                    img.seek(frame_count)
                    frame_count += 1
            except EOFError:
                pass

            # Get duration
            try:
                duration_ms = img.info.get("duration", 100)
                total_duration = (duration_ms * frame_count) / 1000
                fps = frame_count / total_duration if total_duration > 0 else 0
            except:
                total_duration = None
                fps = None

    except Exception as e:
        return False, {"error": f"Failed to read GIF: {e}"}

    # Validate dimensions
    if is_emoji:
        optimal = width == height == 128
        acceptable = width == height and 64 <= width <= 128
        dim_pass = acceptable
    else:
        aspect_ratio = (
            max(width, height) / min(width, height)
            if min(width, height) > 0
            else float("inf")
        )
        dim_pass = aspect_ratio <= 2.0 and 320 <= min(width, height) <= 640

    results = {
        "file": str(gif_path),
        "passes": dim_pass,
        "width": width,
        "height": height,
        "size_kb": size_kb,
        "size_mb": size_mb,
        "frame_count": frame_count,
        "duration_seconds": total_duration,
        "fps": fps,
        "is_emoji": is_emoji,
        "optimal": optimal if is_emoji else None,
    }

    # Print if verbose
    if verbose:
        print(f"\nValidating {gif_path.name}:")
        print(
            f"  Dimensions: {width}x{height}"
            + (
                f" ({'optimal' if optimal else 'acceptable'})"
                if is_emoji and acceptable
                else ""
            )
        )
        print(
            f"  Size: {size_kb:.1f} KB"
            + (f" ({size_mb:.2f} MB)" if size_mb >= 1.0 else "")
        )
        print(
            f"  Frames: {frame_count}"
            + (f" @ {fps:.1f} fps ({total_duration:.1f}s)" if fps else "")
        )

        if not dim_pass:
            print(
                f"  Note: {'Emoji should be 128x128' if is_emoji else 'Unusual dimensions for Slack'}"
            )

        if size_mb > 5.0:
            print(f"  Note: Large file size - consider fewer frames/colors")

    return dim_pass, results


def is_slack_ready(
    gif_path: str | Path, is_emoji: bool = True, verbose: bool = True
) -> bool:
    """
    Quick check if GIF is ready for Slack.

    Args:
        gif_path: Path to GIF file
        is_emoji: True for emoji GIF, False for message GIF
        verbose: Print feedback

    Returns:
        True if dimensions are acceptable
    """
    passes, _ = validate_gif(gif_path, is_emoji, verbose)
    return passes
