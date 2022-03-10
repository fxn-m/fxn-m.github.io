import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio

df = px.data.election()
geojson = px.data.election_geojson()
candidates = df.winner.unique()

fig = go.Figure()

for candidate in list(candidates):
    fig.add_trace(
        go.Choroplethmapbox(geojson=geojson, z=df[candidate],
            locations=df['district'],
            featureidkey="properties.district",
            zmax=6500, zmin=0, marker_opacity=1, marker_line_width=0.2
        )
    )

# Add dropdown
fig.update_layout(
    updatemenus=[go.layout.Updatemenu(
        active=0,
        buttons=list(
            [dict(label='Bergeron',
                  method='update',
                  args=[{'visible': [False, False, True]}]
                  ),
             dict(label='Coderre',
                  method='update',
                  args=[{'visible': [False, True, False]}]
                  ),
             dict(label='Joly',
                  method='update',
                  args=[{'visible': [True, False, False]}]
                  )
             ]
        ),
        direction="down",
        pad={"r": 10, "t": 10},
        showactive=True,
        x=0.085,
        xanchor="left",
        y=1.11,
        yanchor="top",
    )]
)

fig.update_layout(mapbox_style="carto-positron",
    mapbox_zoom=9, mapbox_center={"lat": 45.5517, "lon": -73.7073}
                  )

fig.update_layout(
    margin={"r":0,"t":0,"l":0,"b":0}
    )

# Add annotation
fig.update_layout(
    annotations=[
        dict(text="Candidate:", showarrow=False,
        x=0, y=1.065, yref="paper", align="left")
    ]
)

pio.write_html(fig, file='./dash-oku-map.html', auto_open=True)
