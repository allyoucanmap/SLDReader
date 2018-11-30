import Style from 'ol/style/style';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Circle from 'ol/style/circle';
import Icon from 'ol/style/icon';
import RegularShape from 'ol/style/regularshape';

let icons = {};

/**
 * @private
 * @param  {string} hex   eg #AA00FF
 * @param  {Number} alpha eg 0.5
 * @return {string}       rgba(0,0,0,0)
 */
function hexToRGB(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function polygonStyle(style) {
  let stroke = {};
  if (style.stroke) {
    stroke = style.stroke.css || style.stroke.svg;
  }
  let fill = {};
  if (style.fill) {
    fill = style.fill.css || style.fill.svg;
  }
  return new Style({
    fill:
      fill &&
      new Fill({
        color:
          fill.fillOpacity && fill.fill && fill.fill.slice(0, 1) === '#'
            ? hexToRGB(fill.fill, fill.fillOpacity)
            : fill.fill,
      }),
    stroke:
      stroke &&
      new Stroke({
        color: stroke.strokeOpacity && stroke.stroke && stroke.stroke.slice(0, 1) === '#'
          ? hexToRGB(stroke.stroke, stroke.strokeOpacity)
          : stroke.stroke || '#3399CC',
        width: stroke.strokeWidth || 1.25,
        lineCap: stroke.strokeLinecap && stroke.strokeLinecap,
        lineDash: stroke.strokeDasharray && stroke.strokeDasharray.split(' '),
        lineDashOffset: stroke.strokeDashoffset && stroke.strokeDashoffset,
        lineJoin: stroke.strokeLinejoin && stroke.strokeLinejoin,
      }),
  });
}

/**
 * @private
 * @param  {LineSymbolizer} linesymbolizer [description]
 * @return {object} openlayers style
 */
function lineStyle(linesymbolizer) {
  let style = {};
  if (linesymbolizer.stroke) {
    style = linesymbolizer.stroke.css || linesymbolizer.stroke.svg;
  }
  return new Style({
    stroke: new Stroke({
      color: style.strokeOpacity && style.stroke && style.stroke.slice(0, 1) === '#'
        ? hexToRGB(style.stroke, style.strokeOpacity)
        : style.stroke || '#3399CC',
      width: style.strokeWidth || 1.25,
      lineCap: style.strokeLinecap && style.strokeLinecap,
      lineDash: style.strokeDasharray && style.strokeDasharray.split(' '),
      lineDashOffset: style.strokeDashoffset && style.strokeDashoffset,
      lineJoin: style.strokeLinejoin && style.strokeLinejoin,
    }),
  });
}

function pointStyle(pointsymbolizer) {
  const { graphic: style } = pointsymbolizer;
  if (style.externalgraphic && style.externalgraphic.onlineresource) {
    const src = style.externalgraphic.onlineresource;
    if (!icons[src]) {
      icons[src] = {
        src: src
      };
      const img =  new Image();
      img.onload = () => {
        const side = img.naturalWidth > img.naturalHeight ? img.naturalWidth : img.naturalHeight;
        icons[src] = {
          src: src,
          side
        };
      };
      img.setAttribute('src', src);
    }

    return icons[src].side === undefined ?
      new Style()
      : new Style({
        image: new Icon({
          src: icons[src].src,
          scale: style.size / icons[src].side || 1,
        })
      });
  }
  const fill = new Fill({
    color: 'black',
  });
  const stroke = new Stroke({
    color: 'black',
    width: 2,
  });
  if (style.mark && style.mark.wellknownname === 'cross') {
    return new Style({
      image: new RegularShape({
        fill,
        stroke,
        points: 4,
        radius: style.size || 10,
        radius2: 0,
        angle: 0,
      }),
    });
  }
  if (style.mark && style.mark.wellknownname === 'x') {
    return new Style({
      image: new RegularShape({
        fill,
        stroke,
        points: 4,
        radius: style.size || 10,
        radius2: 0,
        angle: 45,
      }),
    });
  }
  if (style.mark && style.mark.wellknownname === 'star') {
    return new Style({
      image: new RegularShape({
        fill,
        stroke,
        points: 5,
        radius: style.size || 10,
        radius2: 4,
        angle: 45,
      }),
    });
  }
  return new Style({
    image: new Circle({
      radius: 4,
      fill: new Fill({
        color: 'blue',
      }),
    }),
  });
}

/**
 * Create openlayers style
 * @example OlStyler(getGeometryStyles(rules), geojson.geometry.type);
 * @param {GeometryStyles} GeometryStyles rulesconverter
 * @param {string} type geometry type, @see {@link http://geojson.org|geojson}
 * @return ol.style.Style or array of it
 */
export default function OlStyler(GeometryStyles, type = 'Polygon') {
  const { polygon, line, point } = GeometryStyles;
  let styles = [];
  switch (type) {
    case 'Polygon':
    case 'MultiPolygon':
      for (let i = 0; i < polygon.length; i += 1) {
        styles.push(polygonStyle(polygon[i]));
      }
      break;
    case 'LineString':
    case 'MultiLineString':
      for (let j = 0; j < line.length; j += 1) {
        styles.push(lineStyle(line[j]));
      }
      break;
    case 'Point':
    case 'MultiPoint':
      for (let j = 0; j < point.length; j += 1) {
        styles.push(pointStyle(point[j]));
      }
      break;
    default:
      styles = [
        new Style({
          image: new Circle({
            radius: 2,
            fill: new Fill({
              color: 'blue',
            }),
          }),
        }),
      ];
  }
  return styles;
}
