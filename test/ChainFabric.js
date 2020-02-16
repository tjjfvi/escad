
module.exports = escad => {

  const
    or = 7.5,
    ir = 6,
    thickness = .9,
    connectorHeight = .6,
    barAngle = 20,
    width = 210,
    height = 250,
    translateMultiplier = 1.1,
    connectorHoleMultiplier = .25,
    connectorStyle = 1;

  const subpiece = () =>
    escad
      .cube({ dimensions: [Math.sqrt(2) * or, or - ir, thickness], center: true })
      .translate([ 0, ir / 2 - or / 2, 0 ])
      .rotate(45)
      .translate([ or / 2, or / 2, 0 ])

  const subpieceConnector = () =>
    escad
      .cube({ dimensions: [or - ir, or - ir, connectorHeight], center: true })
      .rotate(-45)
      .translate([ or - Math.sqrt(2) / 2 * (or - ir), 0, 0 ])

  const piece = () => ({
    piece: escad.union([0, 90, 180, 270].map(angle =>
      escad.union(
        subpieceConnector(),
        subpiece().translate([ 0, 0, (angle % 180 ? 1 : -1) * (connectorHeight + thickness) / 2]),
      ).rotate(-angle)
    ))
  });

  const connector = () => ({
    connector: escad.difference(
      piece(),
      escad
        .cube({ d: [or, thickness * connectorHoleMultiplier, thickness * 2 + connectorHeight / 2], c: true })
        .rotate(30, 0, 0)
        .translate([ -or / 2, 0, -thickness / 2 - connectorHeight ])
        .rotate(-45)
    )
  })

  let translateAmount = translateMultiplier * or;

  return escad
    .translate(...[width, height].map(n => -Math.floor((n - or * 2) / translateAmount) * translateAmount / 2 - or), 0)(
      escad.meld(escad.range(0, translateAmount, width - or * 2).map(x =>
        escad.meld(escad.range(0, translateAmount, height - or * 2).map(y =>
          escad.translate([ x + or, y + or, 0 ])((
            connectorStyle === 0 ?
              piece :
              connectorStyle === 2 ?
                connector :
                x === 0 || y === 0 ?
                  connector :
                  piece
          )())
        ))
      ))
    )

}
